import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { trackerSchema } from "@/lib/validators";
import { requireAuth, requireEmailVerified, getClientIp } from "@/lib/auth-guard";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const session = await requireEmailVerified();
  if (session instanceof NextResponse) return session;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.fastingRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { gregorianDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.fastingRecord.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({ records, total, page, limit });
}

export async function POST(request: Request) {
  const session = await requireEmailVerified();
  if (session instanceof NextResponse) return session;

  const payload = trackerSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid tracker payload", details: payload.error.flatten() },
      { status: 400 }
    );
  }

  const record = await prisma.fastingRecord.create({
    data: {
      userId: session.user.id,
      gregorianDate: new Date(payload.data.gregorianDate),
      fastingCategory: payload.data.fastingCategory,
      status: payload.data.status,
      notes: payload.data.notes ?? null,
    },
  });

  const ip = getClientIp(request);
  await createAuditLog({
    userId: session.user.id,
    action: "TRACKER_CREATE",
    entityType: "FastingRecord",
    entityId: record.id,
    ipAddress: ip,
  });

  return NextResponse.json({ record }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const url = new URL(request.url);
  const recordId = url.searchParams.get("id");

  if (!recordId) {
    return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
  }

  // Verify ownership before deleting.
  const record = await prisma.fastingRecord.findUnique({ where: { id: recordId } });
  if (!record || record.userId !== session.user.id) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  await prisma.fastingRecord.delete({ where: { id: recordId } });

  const ip = getClientIp(request);
  await createAuditLog({
    userId: session.user.id,
    action: "TRACKER_DELETE",
    entityType: "FastingRecord",
    entityId: recordId,
    ipAddress: ip,
  });

  return NextResponse.json({ deleted: true });
}
