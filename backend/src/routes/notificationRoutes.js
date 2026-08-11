import { Router } from "express";
import * as notificationController from "../controllers/notificationController.js";
import { notificationsStream } from "../controllers/eventsController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateQuery } from "../utils/validate.js";
import { notificationsQuerySchema } from "../utils/schemas/miscSchemas.js";

const router = Router();

router.use(requireAuth);
router.get("/stream", notificationsStream);
router.get("/", validateQuery(notificationsQuerySchema), notificationController.listNotifications);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);

export default router;
