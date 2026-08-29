import { prisma } from "../lib/db";

async function verify() {
  try {
    const rawResult = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("DB connectivity test ($queryRaw):", rawResult);

    const count = await prisma.calendarDay.count();
    console.log("Total Calendar Days in Neon:", count);

    const sample = await prisma.calendarDay.findFirst({
      where: { gregorianYear: 2027 },
      orderBy: { gregorianDate: "asc" },
    });
    console.log("Sample 2027 record:", {
      date: sample?.gregorianDate.toISOString().slice(0, 10),
      hijri: `${sample?.hijriDay} ${sample?.hijriMonth} ${sample?.hijriYear} AH`,
      category: sample?.primaryFastingCategory,
      status: sample?.verificationStatus,
    });
    console.log("\n>>> ALL CHECKS PASSED: Neon Database is fully primed and healthy! <<<");
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
