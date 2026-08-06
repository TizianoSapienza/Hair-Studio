import { Router } from "express";
import * as accountController from "../controllers/accountController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../utils/validate.js";
import { updateProfileSchema } from "../utils/schemas/authSchemas.js";

const router = Router();

router.use(requireAuth);
router.patch("/profile", validateBody(updateProfileSchema), accountController.updateProfile);
router.delete("/", accountController.deleteAccount);

export default router;
