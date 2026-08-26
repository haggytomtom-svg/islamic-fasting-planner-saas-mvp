import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { verifyTotp } from "@/lib/security";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const { token, factorId } = body;

    if (!token || !factorId) {
      return NextResponse.json({ error: "Missing token or factorId" }, { status: 400 });
    }

    const factor = await prisma.mfaFactor.findUnique({
      where: { id: factorId },
    });

    if (!factor || factor.userId !== session.user.id) {
      return NextResponse.json({ error: "Factor not found" }, { status: 404 });
    }

    const isValid = verifyTotp(token, factor.secretHash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    await prisma.mfaFactor.update({
      where: { id: factorId },
      data: { enabledAt: new Date() },
    });

    await prisma.userSecurity.upsert({
      where: { userId: session.user.id },
      update: { mfaRequired: true },
      create: { userId: session.user.id, mfaRequired: true },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "MFA_ENABLED",
      entityType: "MfaFactor",
      entityId: factor.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MFA Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
