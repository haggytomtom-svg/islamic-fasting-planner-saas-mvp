import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { hashPassword, verifyPassword } from '@/lib/security';
import { prisma } from '@/lib/db';
import { sendMfaOtpEmail } from '@/lib/email';
import { otpLimiter } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId: bodyUserId, otp } = body;

    let userId = bodyUserId;

    if (action === 'send') {
      if (!userId) {
        const authResult = await requireAuth();
        if (authResult instanceof NextResponse) return authResult;
        userId = authResult.user.id;
      }

      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized or missing userId' }, { status: 401 });
      }

      const limitResult = await otpLimiter.limit(`send_${userId}`);
      if (!limitResult.success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.email) {
        return NextResponse.json({ error: 'User email not found' }, { status: 404 });
      }

      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await hashPassword(rawOtp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await prisma.emailOtp.create({
        data: {
          userId,
          otpHash,
          expiresAt,
        }
      });

      await sendMfaOtpEmail(user.email, rawOtp);
      return NextResponse.json({ sent: true });
    }

    if (action === 'verify') {
      if (!userId || !otp) {
        return NextResponse.json({ error: 'Missing userId or otp' }, { status: 400 });
      }

      const limitResult = await otpLimiter.limit(`verify_${userId}`);
      if (!limitResult.success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }

      const latestOtp = await prisma.emailOtp.findFirst({
        where: {
          userId,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!latestOtp) {
        return NextResponse.json({ error: 'No valid OTP found' }, { status: 401 });
      }

      const isMatch = await verifyPassword(otp, latestOtp.otpHash);
      if (isMatch) {
        await prisma.emailOtp.update({
          where: { id: latestOtp.id },
          data: { usedAt: new Date() },
        });

        return NextResponse.json({ verified: true });
      }

      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Email OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
