import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/security";
import { registerSchema } from "@/lib/validators";
import { signupLimiter } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Rate limit by IP
    const limitResult = await signupLimiter.limit(ipAddress);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const payload = registerSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: "Invalid registration payload", details: payload.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: payload.data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email: payload.data.email.toLowerCase(),
        passwordHash: await hashPassword(payload.data.password),
        profile: {
          create: {
            fullName: payload.data.fullName,
            countryRegion: payload.data.countryRegion,
          },
        },
        security: {
          create: {
            loginAlerts: true,
          },
        },
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    // Generate email verification token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: { email: user.email, token, expiresAt },
    });

    await sendVerificationEmail(user.email, token);

    await createAuditLog({
      userId: user.id,
      action: "REGISTER",
      entityType: "User",
      entityId: user.id,
      ipAddress,
    });

    return NextResponse.json(
      { user, message: "Account created. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
