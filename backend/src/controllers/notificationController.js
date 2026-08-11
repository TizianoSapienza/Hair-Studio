import { asyncHandler } from "../utils/asyncHandler.js";
import * as notificationService from "../services/notificationService.js";
import { notFound } from "../utils/AppError.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unread === "true";
  res.json({ notifications: await notificationService.listNotifications(req.user.id, { unreadOnly }) });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationRead(req.user.id, req.params.id);
  if (!notification) throw notFound("Notifica non trovata");
  res.json({ notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllNotificationsRead(req.user.id);
  res.status(204).end();
});
