import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { createTotpSecret, createRecoveryCodes, hashPassword } from "@/lib/security";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import QRCode from "qrcode";

export async function POST() {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { secret, otpauth } = createTotpSecret(session.user.email);

    // Store raw TOTP secret so verifyTotp can use it later.
    const factor = await prisma.mfaFactor.create({
      data: {
        userId: session.user.id,
        type: "TOTP",
        secretHash: secret,
      },
    });

    const recoveryCodes = createRecoveryCodes();

    const hashedCodes = await Promise.all(
      recoveryCodes.map(async (code) => ({
        userId: session.user.id,
        codeHash: await hashPassword(code),
      }))
    );

    await prisma.recoveryCode.createMany({ data: hashedCodes });

    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    await createAuditLog({
      userId: session.user.id,
      action: "MFA_ENROLL_STARTED",
      entityType: "MfaFactor",
      entityId: factor.id,
    });

    return NextResponse.json({
      qrCodeDataUrl,
      otpauth,
      recoveryCodes,
      factorId: factor.id,
    });
  } catch (error) {
    console.error("MFA Enroll Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
