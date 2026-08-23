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
