import { asyncHandler } from "../utils/asyncHandler.js";
import * as staffService from "../services/staffService.js";
import { notFound } from "../utils/AppError.js";

export const listStaff = asyncHandler(async (_req, res) => {
  res.json({ staff: await staffService.listStaff() });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.updateStaff(req.params.id, req.body);
  if (!staff) throw notFound("Membro dello staff non trovato");
  res.json({ staff });
});

export const reorderStaff = asyncHandler(async (req, res) => {
  res.json({ staff: await staffService.reorderStaff(req.body.orderedIds) });
});
