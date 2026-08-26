import { prisma } from "../lib/db";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type RawCalendarDay = {
  gd: string;
  dow: string;
  gy: number;
  gm: string;
  gmn: number;
  hy: number;
  hm: string;
  hmn: number;
  hd: number;
  pc: string;
  cats: string;
  oc: number;
  os: string;
  vs: "PROJECTED" | "CONFIRMED";
};

async function main() {
  const dataPath = join(process.cwd(), "public", "calendar-data.js");
  const source = await readFile(dataPath, "utf8");
  const json = source
    .replace(/^window\.ISLAMIC_FASTING_DATA\s*=\s*/, "")
    .replace(/;\s*$/, "");
  const days = JSON.parse(json) as RawCalendarDay[];

  for (const day of days) {
    await prisma.calendarDay.upsert({
      where: { gregorianDate: new Date(day.gd) },
      update: {
        verificationStatus: day.vs,
        primaryFastingCategory: day.pc,
        allApplicableCategories: day.cats,
        overlapCount: day.oc,
        overlapStatus: day.os,
      },
      create: {
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
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
