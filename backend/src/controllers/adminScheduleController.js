import { asyncHandler } from "../utils/asyncHandler.js";
import * as scheduleService from "../services/scheduleService.js";
import { notFound } from "../utils/AppError.js";

export const updateOpeningHours = asyncHandler(async (req, res) => {
  const { days, slotMinutes } = req.body;
  const openingHours = await scheduleService.upsertOpeningHours(days, slotMinutes);
  res.json({ openingHours });
});

export const listClosures = asyncHandler(async (_req, res) => {
  res.json({ closures: await scheduleService.listAllClosures() });
});

export const createClosure = asyncHandler(async (req, res) => {
  const closure = await scheduleService.createClosure(req.body);
  res.status(201).json({ closure });
});

export const updateClosure = asyncHandler(async (req, res) => {
  const closure = await scheduleService.updateClosure(req.params.id, req.body);
  if (!closure) throw notFound("Chiusura non trovata");
  res.json({ closure });
});

export const deleteClosure = asyncHandler(async (req, res) => {
  await scheduleService.deleteClosure(req.params.id);
  res.status(204).end();
});
