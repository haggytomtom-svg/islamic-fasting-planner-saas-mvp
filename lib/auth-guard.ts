import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

/**
 * Require an authenticated session. Returns session or a 401 JSON response.
 */
export async function requireAuth(): Promise<Session | NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

/**
 * Require an admin session. Returns session or a 401/403 JSON response.
 */
export async function requireAdmin(): Promise<Session | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  if (result.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

/**
 * Require an authenticated session with a verified email.
 * Returns session or a 401/403 JSON response.
 */
export async function requireEmailVerified(): Promise<Session | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  if (result.user.emailVerifiedAt === null) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }
  return result;
}

/**
 * Extract client IP address from request headers.
 */
export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
