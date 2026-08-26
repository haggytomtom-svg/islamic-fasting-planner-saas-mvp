import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerifiedAt: new Date() }
    });

    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id }
    });

    await createAuditLog({
      userId: user.id,
      action: "EMAIL_VERIFIED",
      entityType: "User",
      entityId: user.id,
      ipAddress,
    });

    return NextResponse.redirect(new URL("/login?verified=true", request.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
