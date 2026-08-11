import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato data atteso: YYYY-MM-DD");
const uuid = z.string().uuid();

//staff_id assente o "any" -> vista aggregata su tutti gli operatori.
export const calendarQuerySchema = z.object({
  date: dateString,
  staff_id: z
    .union([z.literal("any"), uuid])
    .optional()
    .transform((v) => (v === "any" ? undefined : v)),
});

export const dateRangeQuerySchema = z.object({
  from: dateString,
  to: dateString,
});
