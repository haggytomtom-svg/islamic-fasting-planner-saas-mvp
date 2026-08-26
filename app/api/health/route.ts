import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let dbConnected = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  const status = {
    ok: dbConnected,
    service: "islamic-fasting-planner-saas-mvp",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    dbConnected,
  };

  return NextResponse.json(status, { status: dbConnected ? 200 : 503 });
}
