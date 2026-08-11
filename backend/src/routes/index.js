import { Router } from "express";
import authRoutes from "./authRoutes.js";
import accountRoutes from "./accountRoutes.js";
import publicRoutes from "./publicRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import adminRoutes from "./adminRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import pushTokenRoutes from "./pushTokenRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/account", accountRoutes);
router.use("/", publicRoutes);
router.use("/bookings", bookingRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);
router.use("/push-tokens", pushTokenRoutes);

export default router;
