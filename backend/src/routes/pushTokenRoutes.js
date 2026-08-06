import { Router } from "express";
import * as pushTokenController from "../controllers/pushTokenController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../utils/validate.js";
import { pushTokenSchema } from "../utils/schemas/miscSchemas.js";

const router = Router();

router.use(requireAuth);
router.post("/", validateBody(pushTokenSchema), pushTokenController.registerPushToken);
router.delete("/:token", pushTokenController.deletePushToken);

export default router;
