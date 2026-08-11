import { Router } from "express";
import * as publicController from "../controllers/publicController.js";
import { validateQuery } from "../utils/validate.js";
import { calendarQuerySchema, dateRangeQuerySchema } from "../utils/schemas/scheduleSchemas.js";

const router = Router();

router.get("/public/site-data", publicController.getSiteData);
router.get("/public/calendar", validateQuery(calendarQuerySchema),publicController.getPublicCalendar);
router.get("/services", publicController.getServices);
router.get("/staff", publicController.getStaff);
router.get("/opening-hours", publicController.getOpeningHours);
router.get("/closures", validateQuery(dateRangeQuerySchema), publicController.getClosures);

export default router;
