import { Router } from "express";
import * as bookingController from "../controllers/bookingController.js";
import * as blockedSlotController from "../controllers/blockedSlotController.js";
import * as adminServiceController from "../controllers/adminServiceController.js";
import * as adminStaffController from "../controllers/adminStaffController.js";
import * as adminScheduleController from "../controllers/adminScheduleController.js";
import * as adminContentController from "../controllers/adminContentController.js";
import { adminEventsStream } from "../controllers/eventsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../utils/validate.js";
import {
  adminBookingsQuerySchema,
  adminStatsQuerySchema,
  blockedSlotsQuerySchema,
  createBlockedSlotSchema,
  createBlockedSlotsBulkSchema,
} from "../utils/schemas/bookingSchemas.js";
import { calendarQuerySchema } from "../utils/schemas/scheduleSchemas.js";
import {
  createServiceSchema,
  updateServiceSchema,
  updateStaffSchema,
  reorderSchema,
} from "../utils/schemas/serviceSchemas.js";
import {
  closureSchema,
  updateClosureSchema,
  updateOpeningHoursSchema,
} from "../utils/schemas/scheduleAdminSchemas.js";
import { businessInfoSchema, homepageContentSchema } from "../utils/schemas/contentSchemas.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/events", adminEventsStream);

router.get("/calendar", validateQuery(calendarQuerySchema), bookingController.getAdminCalendar);
router.get("/bookings", validateQuery(adminBookingsQuerySchema), bookingController.adminListBookings);
router.get("/bookings/:id", bookingController.adminGetBooking);
router.post("/bookings/:id/confirm", bookingController.adminConfirmBooking);
router.post("/bookings/:id/complete", bookingController.adminCompleteBooking);
router.post("/bookings/:id/no-show", bookingController.adminNoShowBooking);
router.post("/bookings/:id/cancel", bookingController.adminCancelBooking);
router.get("/stats", validateQuery(adminStatsQuerySchema), bookingController.adminStats);

router.get("/blocked-slots", validateQuery(blockedSlotsQuerySchema), blockedSlotController.listBlockedSlots);
router.post("/blocked-slots", validateBody(createBlockedSlotSchema), blockedSlotController.createBlockedSlot);
router.post("/blocked-slots/bulk", validateBody(createBlockedSlotsBulkSchema), blockedSlotController.createBlockedSlotsBulk);
router.delete("/blocked-slots/:id", blockedSlotController.deleteBlockedSlot);

router.get("/services", adminServiceController.listServices);
router.post("/services", validateBody(createServiceSchema), adminServiceController.createService);
router.patch("/services/reorder", validateBody(reorderSchema), adminServiceController.reorderServices);
router.patch("/services/:id", validateBody(updateServiceSchema), adminServiceController.updateService);
router.delete("/services/:id", adminServiceController.deleteService);
router.get("/services/:id/price-history", adminServiceController.getServicePriceHistory);

router.get("/staff", adminStaffController.listStaff);
router.patch("/staff/reorder", validateBody(reorderSchema), adminStaffController.reorderStaff);
router.patch("/staff/:id", validateBody(updateStaffSchema), adminStaffController.updateStaff);

router.patch("/opening-hours", validateBody(updateOpeningHoursSchema), adminScheduleController.updateOpeningHours);
router.get("/closures", adminScheduleController.listClosures);
router.post("/closures", validateBody(closureSchema), adminScheduleController.createClosure);
router.patch("/closures/:id", validateBody(updateClosureSchema), adminScheduleController.updateClosure);
router.delete("/closures/:id", adminScheduleController.deleteClosure);

router.get("/business-info", adminContentController.getBusinessInfo);
router.patch("/business-info", validateBody(businessInfoSchema), adminContentController.updateBusinessInfo);
router.get("/homepage-content", adminContentController.getHomepageContent);
router.patch("/homepage-content", validateBody(homepageContentSchema), adminContentController.updateHomepageContent);

router.get("/clients", adminContentController.listClients);

export default router;
