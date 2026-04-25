import express from "express";
import { requireAuth } from "../middleware";
import * as AuthController from "../controllers/auth.controller";

export const authRouter = express.Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/refresh", AuthController.refresh);

// Forgot Password Flow
authRouter.post("/forgot-password", AuthController.forgot);
authRouter.post("/resend-reset-code", AuthController.resendResetCode);
authRouter.post("/verify-reset-code", AuthController.verifyResetCode);
authRouter.post("/reset-password", AuthController.resetPassword);

// Email Verification Flow
authRouter.post("/verify-email", AuthController.verifyEmail);
authRouter.post("/resend-verification", AuthController.resendVerifyEmail);

authRouter.post("/logout", requireAuth, AuthController.logout);
