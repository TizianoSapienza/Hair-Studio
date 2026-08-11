import { z } from "zod";

//Almeno una lettera, un numero, un carattere speciale, min 8 caratteri.
//max(72): bcrypt tronca silenziosamente oltre 72 byte, meglio rifiutare
//esplicitamente che accettare una password più lunga solo in apparenza.
const passwordSchema = z
  .string()
  .min(8, "La password deve avere almeno 8 caratteri")
  .max(72, "La password non può superare i 72 caratteri")
  .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
    message: "La password deve contenere una lettera, un numero e un carattere speciale",
  });

export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(20),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(72),
});

export const changePasswordSchema = z.object({
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(255),
  newPassword: passwordSchema,
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(20),
});
