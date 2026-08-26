/**
 * Auth API
 *
 * Owns the payload and response types for `POST /auth/register` and
 * `POST /auth/login`. Does not store the returned session — that belongs to
 * the auth session context.
 */

import { apiRequest } from "@/lib/api/client";

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/**
 * Response for `POST /auth/register`. The backend only returns `code` when it
 * runs in test mode, so clients must not depend on it.
 */
export type RegisterResponse = {
  userId: string;
  code?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

/** Response for `POST /auth/login`. */
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  success: true;
  code?: string;
};

export type VerifyResetCodePayload = {
  resetCode: string;
};

export type VerifyResetCodeResponse = {
  success: true;
};

export type ResendResetCodePayload = {
  email: string;
};

export type ResendResetCodeResponse = {
  success: true;
  code?: string;
};

export type ResetPasswordPayload = {
  resetCode: string;
  newPassword: string;
};

/** Response for `POST /auth/reset-password`. Signs the member in on success. */
export type ResetPasswordResponse = LoginResponse & {
  success: true;
};

/**
 * Creates an account and triggers the verification email. The new member
 * cannot log in until that email is verified.
 */
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/auth/register", { method: "POST", body: payload });
}

/** Exchanges credentials for an access token, refresh token, and user. */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", { method: "POST", body: payload });
}

/** Sends the password reset code email for the supplied address. */
export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

/** Confirms the 6-digit code from the password reset email. */
export async function verifyResetCode(
  payload: VerifyResetCodePayload,
): Promise<VerifyResetCodeResponse> {
  return apiRequest<VerifyResetCodeResponse>("/auth/verify-reset-code", {
    method: "POST",
    body: payload,
  });
}

/** Sends a new password reset code for the supplied address. */
export async function resendResetCode(
  payload: ResendResetCodePayload,
): Promise<ResendResetCodeResponse> {
  return apiRequest<ResendResetCodeResponse>("/auth/resend-reset-code", {
    method: "POST",
    body: payload,
  });
}

/** Exchanges a verified reset code for a new password and session. */
export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

export type VerifyEmailPayload = {
  verificationCode: string;
};

/** Response for `POST /auth/verify-email`. Signs the member in on success. */
export type VerifyEmailResponse = LoginResponse & {
  success: true;
};

export type ResendVerificationPayload = {
  email: string;
};

/** Response for `POST /auth/resend-verification`. */
export type ResendVerificationResponse = {
  success: true;
  code?: string;
};

/** Confirms the 6-digit code emailed after registration. */
export async function verifyEmail(payload: VerifyEmailPayload): Promise<VerifyEmailResponse> {
  return apiRequest<VerifyEmailResponse>("/auth/verify-email", {
    method: "POST",
    body: payload,
  });
}

/** Sends a fresh verification code when the previous one expired or was lost. */
export async function resendVerification(
  payload: ResendVerificationPayload,
): Promise<ResendVerificationResponse> {
  return apiRequest<ResendVerificationResponse>("/auth/resend-verification", {
    method: "POST",
    body: payload,
  });
}

/** Login error returned when the account exists but email is not verified yet. */
export const UNVERIFIED_EMAIL_ERROR = "User has not verified email";
