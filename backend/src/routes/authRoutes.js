import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validateBody } from "../utils/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../utils/schemas/authSchemas.js";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), authController.register);
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.post("/verify-email", authLimiter, validateBody(verifyEmailSchema), authController.verifyEmail);
router.post("/resend-verification", authLimiter, validateBody(resendVerificationSchema), authController.resendVerification);
router.post("/refresh", authController.refresh);
//Nessun requireAuth: deve funzionare anche con access token già scaduto,
//altrimenti il logout stesso fallisce con 401 (vedi tokenService.js).
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authLimiter, validateBody(resetPasswordSchema), authController.resetPassword);

export default router;
