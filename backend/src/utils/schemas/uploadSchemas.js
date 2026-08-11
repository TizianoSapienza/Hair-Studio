import { z } from "zod";

export const presignUploadSchema = z.object({
  folder: z.enum(["staff", "homepage", "branding"]),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  extension: z.enum(["jpg", "jpeg", "png", "webp"]),
});

export const listUploadsQuerySchema = z.object({
  folder: z.enum(["staff", "homepage", "branding"]),
});
