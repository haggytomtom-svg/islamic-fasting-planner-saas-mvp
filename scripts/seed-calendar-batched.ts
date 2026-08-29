/**
 * Resilient calendar seeder — uses Neon pooler + retries + delays.
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

const BATCH_SIZE = 200;
const DELAY_MS = 2000;
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function seedBatch(days: RawCalendarDay[], batchNum: number, dbUrl: string): Promise<number> {
  const prisma = new PrismaClient({ datasourceUrl: dbUrl });
  try {
    const result = await prisma.calendarDay.createMany({
      data: days.map((day) => ({
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
    return result.count;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  // Use pooler URL for better connection handling
  const directUrl = process.env.DATABASE_URL!;
  const poolerUrl = directUrl.replace(
    "ep-soft-band-ax3ojnqs.",
    "ep-soft-band-ax3ojnqs-pooler."
  );

  console.log("Using pooler connection for seeding");

  const dataPath = join(process.cwd(), "public", "calendar-data.js");
  const source = await readFile(dataPath, "utf8");
  const json = source.replace(/^window\.ISLAMIC_FASTING_DATA\s*=\s*/, "").replace(/;\s*$/, "");
  const days = JSON.parse(json) as RawCalendarDay[];
  console.log(`Total calendar days to process: ${days.length}`);

  let totalInserted = 0;

  for (let i = 0; i < days.length; i += BATCH_SIZE) {
    const batch = days.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(days.length / BATCH_SIZE);

    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const inserted = await seedBatch(batch, batchNum, poolerUrl);
        totalInserted += inserted;
        const end = Math.min(i + BATCH_SIZE, days.length);
        console.log(`Batch ${batchNum}/${totalBatches}: rows ${i + 1}–${end} (${inserted} new, ${batch.length - inserted} skipped)`);
        success = true;
        break;
      } catch (err: any) {
        console.warn(`Batch ${batchNum} attempt ${attempt} failed: ${err.message?.slice(0, 80)}`);
        if (attempt < MAX_RETRIES) {
          const backoff = DELAY_MS * attempt * 2;
          console.log(`  Retrying in ${backoff / 1000}s...`);
          await sleep(backoff);
        }
      }
    }

    if (!success) {
      console.error(`Batch ${batchNum} failed after ${MAX_RETRIES} attempts. Continuing...`);
    }

    // Delay between batches to avoid overwhelming Neon
    await sleep(DELAY_MS);
  }

  // Final count
  await sleep(3000);
  const prisma = new PrismaClient({ datasourceUrl: poolerUrl });
  try {
    const count = await prisma.calendarDay.count();
    console.log(`\nDone! Total rows in database: ${count} / ${days.length}`);
    console.log(`New rows inserted this run: ${totalInserted}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
