import { Router } from "express";
import * as bookingController from "../controllers/bookingController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../utils/validate.js";
import { createBookingSchema } from "../utils/schemas/bookingSchemas.js";

const router = Router();

router.use(requireAuth);
router.post("/", validateBody(createBookingSchema), bookingController.createBooking);
router.get("/me", bookingController.listMyBookings);
router.post("/:id/cancel", bookingController.cancelMyBooking);

export default router;
