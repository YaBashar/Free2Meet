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
