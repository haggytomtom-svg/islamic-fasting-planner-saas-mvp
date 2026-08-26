import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, getClientIp } from "@/lib/auth-guard";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        profile: { select: { fullName: true, countryRegion: true } },
        subscriptions: { select: { plan: true, status: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({ users, total, page, limit });
}

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]),
});

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const validated = updateRoleSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid request data", details: validated.error.flatten() }, { status: 400 });
  }

  const { userId, role } = validated.data;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true, emailVerifiedAt: true },
  });

  const ip = getClientIp(request);
  await createAuditLog({
    userId: session.user.id,
    action: "ADMIN_USER_UPDATE",
    entityType: "User",
    entityId: userId,
    metadata: { newRole: role },
    ipAddress: ip,
  });

  return NextResponse.json(updatedUser);
}
