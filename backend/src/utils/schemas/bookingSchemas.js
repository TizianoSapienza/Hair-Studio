import { z } from "zod";

const timeString = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Formato orario atteso: HH:MM");
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato data atteso: YYYY-MM-DD");

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  staffId: z.union([z.literal("any"), z.string().uuid()]),
  date: dateString,
  startTime: timeString,
  notes: z.string().max(1000).optional(),
});

export const adminBookingsQuerySchema = z.object({
  date: dateString.optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  staff_id: z.string().uuid().optional(),
  status: z.enum(["in_attesa", "confermata", "completata", "cancellata", "no_show"]).optional(),
  q: z.string().optional(),
});

export const adminStatsQuerySchema = z.object({
  from: dateString,
  to: dateString,
});

export const createBlockedSlotSchema = z.object({
  staffId: z.string().uuid(),
  date: dateString,
  startTime: timeString,
  endTime: timeString,
  note: z.string().max(500).optional(),
});

export const createBlockedSlotsBulkSchema = z.object({
  staffIds: z.array(z.string().uuid()).min(1),
  date: dateString,
  slots: z.array(z.object({ startTime: timeString, endTime: timeString })).min(1),
  note: z.string().max(500).optional(),
});

export const blockedSlotsQuerySchema = z.object({
  date: dateString.optional(),
  staff_id: z.string().uuid().optional(),
});
