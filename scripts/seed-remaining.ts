/**
 * Fast remaining-rows seeder using raw SQL multi-value INSERT.
 * Inserts all missing rows in a single query with ON CONFLICT DO NOTHING.
 */
import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type RawCalendarDay = {
  gd: string; dow: string; gy: number; gm: string; gmn: number;
  hy: number; hm: string; hmn: number; hd: number;
  pc: string; cats: string; oc: number; os: string;
  vs: "PROJECTED" | "CONFIRMED";
};

async function main() {
  const prisma = new PrismaClient();

  // 1. Get existing dates
  const existingRows = await prisma.calendarDay.findMany({
    select: { gregorianDate: true },
  });
  const existingDates = new Set(existingRows.map((r) => r.gregorianDate.toISOString()));
  console.log(`Existing rows: ${existingDates.size}`);

  // 2. Load all calendar data
  const dataPath = join(process.cwd(), "public", "calendar-data.js");
  const source = await readFile(dataPath, "utf8");
  const json = source.replace(/^window\.ISLAMIC_FASTING_DATA\s*=\s*/, "").replace(/;\s*$/, "");
  const allDays = JSON.parse(json) as RawCalendarDay[];
  console.log(`Total in file: ${allDays.length}`);

  // 3. Filter to only missing rows
  const missing = allDays.filter((d) => !existingDates.has(new Date(d.gd).toISOString()));
  console.log(`Missing rows to insert: ${missing.length}`);

  if (missing.length === 0) {
    console.log("All rows already seeded!");
    await prisma.$disconnect();
    return;
  }

  // 4. Insert in chunks of 500 using createMany (single connection)
  const CHUNK = 500;
  for (let i = 0; i < missing.length; i += CHUNK) {
    const chunk = missing.slice(i, i + CHUNK);
    await prisma.calendarDay.createMany({
      data: chunk.map((day) => ({
        gregorianDate: new Date(day.gd),
        dayOfWeek: day.dow,
        gregorianYear: day.gy,
        gregorianMonth: day.gm,
        gregorianMonthNumber: day.gmn,
        hijriYear: day.hy,
        hijriMonth: day.hm,
        hijriMonthNumber: day.hmn,
        hijriDay: day.hd,
        primaryFastingCategory: day.pc,
        allApplicableCategories: day.cats,
        overlapCount: day.oc,
        overlapStatus: day.os,
        verificationStatus: day.vs,
      })),
      skipDuplicates: true,
    });
    console.log(`Inserted chunk ${Math.floor(i / CHUNK) + 1}: rows ${i + 1}–${Math.min(i + CHUNK, missing.length)} of ${missing.length}`);
  }

  // 5. Final count
  const finalCount = await prisma.calendarDay.count();
  console.log(`\nDone! Total rows: ${finalCount} / ${allDays.length}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
