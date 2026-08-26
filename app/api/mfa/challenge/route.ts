import { NextResponse } from 'next/server';
import { verifyTotp, verifyPassword } from '@/lib/security';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { otpLimiter } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, token, type } = body;

    if (!userId || !token || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const limitResult = await otpLimiter.limit(userId);
    if (!limitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (type === 'totp') {
      const factor = await prisma.mfaFactor.findFirst({
        where: { userId, type: 'TOTP', enabledAt: { not: null } },
      });

      if (!factor) {
        return NextResponse.json({ error: 'MFA not enabled' }, { status: 400 });
      }

      const isValid = verifyTotp(token, factor.secretHash);

      if (isValid) {
        await createAuditLog({
          userId,
          action: 'MFA_VERIFIED',
          entityType: 'MfaFactor',
          entityId: factor.id,
        });
        return NextResponse.json({ verified: true });
      }
    } else if (type === 'recovery') {
      const unusedCodes = await prisma.recoveryCode.findMany({
        where: { userId, usedAt: null },
      });

      for (const codeRecord of unusedCodes) {
        const isMatch = await verifyPassword(token, codeRecord.codeHash);
        if (isMatch) {
          await prisma.recoveryCode.update({
            where: { id: codeRecord.id },
            data: { usedAt: new Date() },
          });

          await createAuditLog({
            userId,
            action: 'RECOVERY_CODE_USED',
            entityType: 'RecoveryCode',
            entityId: codeRecord.id,
          });

          return NextResponse.json({ verified: true });
        }
      }
    } else {
      return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid MFA code' }, { status: 401 });
  } catch (error) {
    console.error('MFA Challenge Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
