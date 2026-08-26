import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createTotpSecret(email: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, "Islamic Fasting Planner PRO", secret);
  return { secret, otpauth };
}

export function verifyTotp(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}

export function createRecoveryCodes() {
  return Array.from({ length: 10 }, () => {
    const left = crypto.randomUUID().slice(0, 4).toUpperCase();
    const right = crypto.randomUUID().slice(0, 4).toUpperCase();
    return `${left}-${right}`;
  });
}
