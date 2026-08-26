import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { moonSightingSchema } from "@/lib/validators";
import { requireAdmin, getClientIp } from "@/lib/auth-guard";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const payload = moonSightingSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid moon-sighting payload", details: payload.error.flatten() },
      { status: 400 }
    );
  }

  const announcement = await prisma.moonSightingAnnouncement.create({
    data: {
      hijriMonth: payload.data.hijriMonth,
      hijriYear: payload.data.hijriYear,
      confirmedStartDate: new Date(payload.data.confirmedStartDate),
      authority: payload.data.authority,
      region: payload.data.region,
      adjustmentVsProjection: payload.data.adjustmentVsProjection,
      notes: payload.data.notes ?? null,
      publishedAt: new Date(),
    },
  });

  const ip = getClientIp(request);
  await createAuditLog({
    userId: session.user.id,
    action: "MOON_SIGHTING_PUBLISHED",
    entityType: "MoonSightingAnnouncement",
    entityId: announcement.id,
    ipAddress: ip,
  });

  return NextResponse.json(announcement, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const [announcements, total] = await Promise.all([
    prisma.moonSightingAnnouncement.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.moonSightingAnnouncement.count(),
  ]);

  return NextResponse.json({ announcements, total, page, limit });
}
