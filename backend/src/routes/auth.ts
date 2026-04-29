import express from "express";
import {
  forgotPasswordLimiter,
  loginLimiter,
  refreshLimiter,
  registrationLimiter,
  requireAuth,
  resendVerifLimiter,
  resetCodeLimiter,
  verifyEmailLimiter,
  authenticatedRouteLimiter,
} from "../middleware";
import * as AuthController from "../controllers/auth.controller";

export const authRouter = express.Router();

authRouter.post("/register", registrationLimiter, AuthController.register);
authRouter.post("/login", loginLimiter, AuthController.login);
authRouter.post("/refresh", refreshLimiter, AuthController.refresh);

// Forgot Password Flow
authRouter.post("/forgot-password", forgotPasswordLimiter, AuthController.forgot);
authRouter.post("/resend-reset-code", resetCodeLimiter, AuthController.resendResetCode);
authRouter.post("/verify-reset-code", resetCodeLimiter, AuthController.verifyResetCode);
authRouter.post("/reset-password", resetCodeLimiter, AuthController.resetPassword);

// Email Verification Flow
authRouter.post("/verify-email", verifyEmailLimiter, AuthController.verifyEmail);
authRouter.post("/resend-verification", resendVerifLimiter, AuthController.resendVerifyEmail);

authRouter.post("/logout", authenticatedRouteLimiter, requireAuth, AuthController.logout);
authRouter.delete("/delete-account", requireAuth, AuthController.deleteUserAccount);
authRouter.post("/reactivate", loginLimiter, AuthController.reactivate);
