import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/security";
import { createAuditLog } from "@/lib/audit";

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const body = await request.json();
    const validated = resetPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { token, newPassword } = validated.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email }
    });

    await prisma.userSession.deleteMany({
      where: { userId: user.id }
    });

    await prisma.userSecurity.upsert({
      where: { userId: user.id },
      create: { userId: user.id, lastPasswordAt: new Date() },
      update: { lastPasswordAt: new Date() }
    });

    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET",
      entityType: "User",
      entityId: user.id,
      ipAddress,
    });

    return NextResponse.json({ message: "Password has been reset." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
