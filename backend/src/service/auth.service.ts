import {
  validateEmailFormat,
  checkEmailAvailable,
  checkPassword,
  hashPassword,
} from "../utils/authHelper";
import { UserModel, User } from "../models/userModel";
import { hashCode, generateCode } from "../utils/authHelper";

import bcrypt from "bcrypt";
import crypto from "crypto";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { RefreshTokenModel } from "../models/refreshTokenModel";
import { JwtPayload } from "../middleware";

const SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 7;
const ACCESS_TOKEN_TTL_MINUTES = Number(process.env.accessTokenTtlMinutes) || 15;

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** [1] AuthRegister
 * Registers a user with an email, password, and name
 **/

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  userId: string;
  code?: string;
}

export async function registerUser(input: RegisterInput): Promise<RegisterResponse> {
  const sanitizedFirstName = input.firstName.trim();
  const sanitizedLastName = input.lastName.trim();
  const sanitizedEmail = validateEmailFormat(input.email);

  if (/[^a-zA-Z ]/.test(sanitizedFirstName)) {
    throw new AuthError("First name cannot contain special characters or numbers");
  }

  if (/[^a-zA-Z ]/.test(sanitizedLastName)) {
    throw new AuthError("Last name cannot contain special characters or numbers");
  }

  const name = `${sanitizedFirstName} ${sanitizedLastName}`;
  if (name.length < 2 || name.length > 20) {
    throw new AuthError("Name must be between 2 and 20 characters.");
  }

  try {
    await checkEmailAvailable(sanitizedEmail);
    checkPassword(input.password);
  } catch (error) {
    throw new AuthError(error.message);
  }

  const hashedPassword = await hashPassword(input.password);
  const { code, expiry } = generateCode();
  const newUser = new UserModel({
    name: name,
    password: hashedPassword,
    email: sanitizedEmail,
    verificationCode: hashCode(code),
    verificationCodeExpiry: expiry,
  });

  await newUser.save();
  return { userId: newUser._id.toString(), code };
}

/** [2] Auth Login
 * Logs in a user
 **/

interface LoginInput {
  email: string;
  password: string;
}

async function createRefreshToken(user: User): Promise<string> {
  const token = crypto.randomBytes(64).toString("hex");

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    user: user._id.toString(),
    token,
    expiresAt,
  });

  return token;
}

function createAccessToken(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
  } satisfies JwtPayload;

  return jwt.sign(payload, SECRET, {
    expiresIn: `${ACCESS_TOKEN_TTL_MINUTES}m`,
  });
}

export async function userLogin(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email });
  if (!user) {
    throw new AuthError("Invalid Username or Password");
  }

  const isPassword = await bcrypt.compare(input.password, user.password);

  if (!isPassword) {
    throw new AuthError("Invalid Username or Password");
  }

  if (!user.emailVerified) {
    throw new AuthError("User has not verified email");
  }

  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user);
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { id: user._id.toString(), name: user.name, email: user.email },
  };
}

/** [3] Auth Refresh
 * Allows user to stay loggedIn
 **/
export async function authRefresh(token: string) {
  const refreshToken = await RefreshTokenModel.findOne({ token, revokedAt: null });
  if (!refreshToken) {
    // token was invalid possible reuse attack
    const compromised = await RefreshTokenModel.findOne({ token });
    if (compromised) {
      await RefreshTokenModel.updateMany(
        { user: compromised.user },
        { $set: { revoked: Date.now() } }
      );
    }
    throw new AuthError("Token is invalid");
  }

  if (refreshToken.expiresAt < new Date()) {
    throw new AuthError("Refresh Token has expired");
  }

  const user = await UserModel.findById(refreshToken.user);
  if (!user) {
    throw new AuthError("User not found");
  }

  await RefreshTokenModel.findOneAndUpdate({ token }, { $set: { revokedAt: Date.now() } });

  const accessToken = createAccessToken(user);
  const newRefreshToken = await createRefreshToken(user);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function userVerifyEmail(verificationCode: string) {
  const hashedCode = hashCode(verificationCode);
  const user = await UserModel.findOne({ verificationCode: hashedCode });
  if (!user) {
    throw new AuthError("Invalid Verification Code");
  }

  if (user.verificationCodeExpiry && user.verificationCodeExpiry < new Date()) {
    throw new AuthError("Verification code has expired");
  }

  user.verificationCode = undefined;
  user.verificationCodeExpiry = undefined;
  user.accountExpiresAt = null;
  user.emailVerified = true;
  user.updatedAt = new Date();

  await user.save();

  // Return accessToken and refreshToken so user is immediately logged in by the frontend
  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  return {
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
}

export async function resendVerificationCode(email: string) {
  const normalisedEmail = validateEmailFormat(email);
  const { code, expiry } = generateCode();
  const hashedCode = hashCode(code);

  const user = await UserModel.findOne({ email: normalisedEmail });
  // Silently return success if user not found — prevents user enumeration
  if (!user) {
    return { success: true };
  }

  if (user.emailVerified) {
    throw new AuthError("Email is already verified");
  }

  await UserModel.findOneAndUpdate(
    { _id: user._id },
    { $set: { verificationCode: hashedCode, verificationCodeExpiry: expiry } }
  );

  return { success: true, code };
}

export async function forgotPassword(email: string) {
  const normalisedEmail = validateEmailFormat(email);
  const { code, expiry } = generateCode();
  const hashedCode = hashCode(code);

  const user = await UserModel.findOne({ email: normalisedEmail });
  // Silently return success if user not found — prevents user enumeration
  if (!user) {
    return { success: true };
  }

  user.resetCode = hashedCode;
  user.resetCodeExpiry = expiry;
  await user.save();

  return { success: true, code };
}

export async function verifyResetCodeService(resetCode: string) {
  const hashedCode = hashCode(resetCode);
  const user = await UserModel.findOne({
    resetCode: hashedCode,
    resetCodeExpiry: { $gt: new Date() }, // Check expiry in one query
  });

  if (!user) {
    throw new AuthError("Invalid or expired reset code");
  }

  return { success: true };
}

export async function resendResetCodeService(email: string) {
  const normalisedEmail = validateEmailFormat(email);
  const { code, expiry } = generateCode();
  const hashedCode = hashCode(code);

  const user = await UserModel.findOne({ email: normalisedEmail });
  // Silently return success if user not found — prevents user enumeration
  if (!user) {
    return { success: true };
  }

  await UserModel.findOneAndUpdate(
    { _id: user._id },
    { $set: { resetCode: hashedCode, resetCodeExpiry: expiry } }
  );

  return { success: true, code };
}

export async function resetPasswordService(resetCode: string, newPassword: string) {
  if (newPassword.length < 12) {
    throw new AuthError("Password must be at least 12 characters");
  }

  const hashedCode = hashCode(resetCode);
  const user = await UserModel.findOne({
    resetCode: hashedCode,
    resetCodeExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new AuthError("Invalid or expired reset code");
  }

  // Check if new password is same as current
  if (await bcrypt.compare(newPassword, user.password)) {
    throw new AuthError("New password must be different from your current password");
  }

  try {
    checkPassword(newPassword);
  } catch (error) {
    throw new AuthError(error.message);
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  user.resetCode = undefined;
  user.resetCodeExpiry = undefined;
  user.updatedAt = new Date();

  await user.save();

  // Revoke all existing sessions with old password
  await RefreshTokenModel.updateMany(
    { user: user._id.toString() },
    { $set: { revokedAt: new Date() } }
  );

  // Return accessToken and refreshToken so user is immediately logged in by the frontend
  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  return {
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
}

export async function userLogout(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AuthError("User not found");
  }

  // Inactivate all refresh Tokens
  // Client side must delete the access token
  // Access token expires eventually and cannot regenerate as refreshtokens have been revoked
  await RefreshTokenModel.updateMany({ user: userId }, { $set: { revokedAt: new Date() } });

  return { success: true };
}
