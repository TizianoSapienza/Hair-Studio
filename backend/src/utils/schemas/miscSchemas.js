import { z } from "zod";

export const pushTokenSchema = z.object({
  token: z.string().min(1),
  deviceLabel: z.string().max(200).optional(),
});

export const notificationsQuerySchema = z.object({
  unread: z.enum(["true", "false"]).optional(),
});
