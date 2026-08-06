import { z } from "zod";

//"" (campo URL non compilato nel form) viene trattato come assente.
const optionalUrl = z.preprocess((v) => (v === "" ? undefined : v), z.string().url().optional());

export const createServiceSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().max(2000).optional(),
  durationMinutes: z.number().int().positive().multipleOf(30),
  price: z.number().nonnegative(),
  imageUrl: optionalUrl,
  active: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const updateStaffSchema = z.object({
  name: z.string().trim().min(1).optional(),
  photoUrl: optionalUrl,
  specialization: z.string().max(200).optional(),
  displayOrder: z.number().int().optional(),
});

//Riusato per il riordino sia dei servizi sia dello staff: l'ordine dell'array è il nuovo
//display_order (0-based).
export const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});
