import { z } from "zod";

const timeString = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const openingDaySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    isOpen: z.boolean(),
    startTime: timeString.optional(),
    endTime: timeString.optional(),
  })
  .refine((d) => !d.isOpen || (d.startTime && d.endTime), {
    message: "startTime/endTime richiesti quando isOpen è true",
  });

export const updateOpeningHoursSchema = z.object({
  days: z.array(openingDaySchema).length(7),
  slotMinutes: z.number().int().positive().optional(),
});

export const closureSchema = z
  .object({
    startDate: dateString,
    endDate: dateString.optional(),
    closureType: z.enum(["closed", "modified"]).default("closed"),
    openTime: timeString.optional(),
    closeTime: timeString.optional(),
    note: z.string().max(500).optional(),
  })
  .refine((d) => d.closureType === "closed" || (d.openTime && d.closeTime), {
    message: "openTime/closeTime richiesti per le chiusure di tipo 'modified'",
  });

export const updateClosureSchema = z.object({
  startDate: dateString.optional(),
  endDate: dateString.nullable().optional(),
  closureType: z.enum(["closed", "modified"]).optional(),
  openTime: timeString.nullable().optional(),
  closeTime: timeString.nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});
