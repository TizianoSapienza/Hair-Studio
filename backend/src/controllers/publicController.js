import { asyncHandler } from "../utils/asyncHandler.js";
import { getBusinessInfo } from "../services/businessInfoService.js";
import { getHomepageContent } from "../services/homepageContentService.js";
import { listActiveServices } from "../services/serviceService.js";
import { listStaff } from "../services/staffService.js";
import {
  getDayOverview,
  getClosuresInRange,
  getOpeningHoursList,
  getSlotMinutes,
} from "../services/scheduleService.js";

export const getSiteData = asyncHandler(async (_req, res) => {
  const [businessInfo, homepageContent, services, staff] = await Promise.all([
    getBusinessInfo(),
    getHomepageContent(),
    listActiveServices(),
    listStaff(),
  ]);

  res.json({ businessInfo, homepageContent, services, staff });
});

export const getServices = asyncHandler(async (_req, res) => {
  res.json({ services: await listActiveServices() });
});

export const getStaff = asyncHandler(async (_req, res) => {
  res.json({ staff: await listStaff() });
});

export const getOpeningHours = asyncHandler(async (_req, res) => {
  const [openingHours, slotMinutes] = await Promise.all([getOpeningHoursList(), getSlotMinutes()]);
  res.json({ openingHours, slotMinutes });
});

export const getClosures = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  res.json({ closures: await getClosuresInRange(from, to) });
});

// Vista pubblica del calendario: SOLO libero/occupato (+ conteggio operatori liberi se
// staff_id è "any"/assente), mai dettagli della prenotazione (privacy, vedi CLAUDE.md).
export const getPublicCalendar = asyncHandler(async (req, res) => {
  const { date, staff_id: staffId } = req.query;
  const { open, reason, slotMinutes, slots } = await getDayOverview(date, staffId, {
    includeDetails: false,
  });
  res.json({ open, reason, slotMinutes, slots });
});
