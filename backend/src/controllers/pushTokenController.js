import { asyncHandler } from "../utils/asyncHandler.js";
import * as pushTokenService from "../services/pushTokenService.js";
import { conflict } from "../utils/AppError.js";

export const registerPushToken = asyncHandler(async (req, res) => {
  const pushToken = await pushTokenService.upsertPushToken(req.user.id, req.body.token, req.body.deviceLabel);
  if (!pushToken) throw conflict("Questo dispositivo è già registrato su un altro account");
  res.status(201).json({ pushToken });
});

export const deletePushToken = asyncHandler(async (req, res) => {
  await pushTokenService.deletePushToken(req.user.id, req.params.token);
  res.status(204).end();
});
