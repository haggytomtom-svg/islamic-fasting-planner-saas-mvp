import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  fullName: z.string().min(2).max(120).optional(),
  countryRegion: z.string().min(2).max(80).default("Nigeria"),
});

export const trackerSchema = z.object({
  gregorianDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fastingCategory: z.string().min(2).max(80),
  status: z.enum(["Planned", "Completed", "Missed", "Exempt", "Make-up Needed"]),
  notes: z.string().max(1000).optional(),
});

export const moonSightingSchema = z.object({
  hijriMonth: z.string().min(2).max(80),
  hijriYear: z.number().int().min(1400).max(1600),
  confirmedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  authority: z.string().min(2).max(160),
  region: z.string().min(2).max(80).default("Nigeria"),
  adjustmentVsProjection: z.number().int().min(-2).max(2),
  notes: z.string().max(1000).optional(),
});
