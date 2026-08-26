import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { passwordResetLimiter } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    
    const limitResult = await passwordResetLimiter.limit(ipAddress);
    if (!limitResult.success) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const validated = forgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email } = validated.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await prisma.passwordResetToken.deleteMany({
        where: { email }
      });

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt,
        }
      });

      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
