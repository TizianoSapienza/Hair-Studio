import { asyncHandler } from "../utils/asyncHandler.js";
import * as blockedSlotService from "../services/blockedSlotService.js";

export const listBlockedSlots = asyncHandler(async (req, res) => {
  const { date, staff_id: staffId } = req.query;
  res.json({ blockedSlots: await blockedSlotService.listBlockedSlots({ date, staffId }) });
});

export const createBlockedSlot = asyncHandler(async (req, res) => {
  const blockedSlot = await blockedSlotService.createBlockedSlot({
    ...req.body,
    createdBy: req.user.id,
  });
  res.status(201).json({ blockedSlot });
});

export const createBlockedSlotsBulk = asyncHandler(async (req, res) => {
  const result = await blockedSlotService.createBlockedSlotsBulk({
    ...req.body,
    createdBy: req.user.id,
  });
  res.status(201).json(result);
});

export const deleteBlockedSlot = asyncHandler(async (req, res) => {
  await blockedSlotService.deleteBlockedSlot(req.params.id);
  res.status(204).end();
});
