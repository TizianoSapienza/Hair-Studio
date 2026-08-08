import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validateBody } from "../utils/validate.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../utils/schemas/authSchemas.js";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), authController.register);
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
//Nessun requireAuth: deve funzionare anche con access token già scaduto,
//altrimenti il logout stesso fallisce con 401 (vedi tokenService.js).
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);
router.post("/change-password", requireAuth, authLimiter, validateBody(changePasswordSchema), authController.changePassword);
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authLimiter, validateBody(resetPasswordSchema), authController.resetPassword);

export default router;
