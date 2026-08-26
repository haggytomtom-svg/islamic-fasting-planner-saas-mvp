import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Islamic Fasting Planner PRO <noreply@yourdomain.com>';

const DISCLAIMER = `
\n\n
--
Disclaimer: The generated Islamic fasting projections and calendars provided by this service are based on calculation estimates and are intended for general planning purposes only. They are not a substitute for actual moon sighting or official announcements from local Islamic authorities. Please verify dates with your local community.
`;

const getAppUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const url = `${getAppUrl()}/api/auth/verify-email?token=${token}`;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - Islamic Fasting Planner PRO',
      text: `Please verify your email by clicking the following link: ${url}${DISCLAIMER}`,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    const url = `${getAppUrl()}/reset-password?token=${token}`;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password - Islamic Fasting Planner PRO',
      text: `Reset your password by clicking the following link: ${url}${DISCLAIMER}`,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

export async function sendLoginAlertEmail(email: string, ipAddress: string, userAgent: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'New Login Alert - Islamic Fasting Planner PRO',
      text: `We noticed a new login to your account.\nIP: ${ipAddress}\nDevice: ${userAgent}\nIf this wasn't you, please secure your account immediately.${DISCLAIMER}`,
    });
  } catch (error) {
    console.error('Failed to send login alert email:', error);
  }
}

export async function sendMfaOtpEmail(email: string, otp: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Login Code - Islamic Fasting Planner PRO',
      text: `Your login code is: ${otp}\nThis code will expire in 10 minutes.${DISCLAIMER}`,
    });
  } catch (error) {
    console.error('Failed to send MFA OTP email:', error);
  }
}

export async function sendPaymentFailedEmail(email: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Payment Failed - Islamic Fasting Planner PRO',
      text: `Your recent subscription payment failed. Please update your payment information to maintain access to PRO features.${DISCLAIMER}`,
    });
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
  }
}
