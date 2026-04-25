import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserModel } from "../models/userModel";

export function checkPassword(password: string): void {
  if (password.length < 8) {
    throw new Error("password must be longer than 8 characters");
  }

  if (!(/[a-z]/.test(password) && /[A-Z]/.test(password))) {
    throw new Error("password must containe upper and lower case characters");
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    throw new Error("password must contain a special character");
  }
}

export function validateEmailFormat(email: string): string {
  if (typeof email !== "string") {
    throw new Error("invalid email format");
  }

  const sanitized = email
    .replace(/[\r\n]/g, "")
    .toLowerCase()
    .trim();
  if (sanitized.length > 254 || !validator.isEmail(sanitized)) {
    throw new Error("invalid email format");
  }

  return sanitized;
}

export async function checkEmailAvailable(email: string): Promise<void> {
  const existingEmail = await UserModel.findOne({ email });
  if (existingEmail) {
    throw new Error("Account already exists with email");
  }
}

export async function checkNewPasswd(
  previousPasswds: string[],
  newPassword: string,
  confirmNewPasswd: string
): Promise<void> {
  try {
    checkPassword(newPassword);
    for (const passwd of previousPasswds) {
      if (await bcrypt.compare(newPassword, passwd)) {
        throw new Error("Password has been used before, try a new password");
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }

  if (confirmNewPasswd !== newPassword) {
    throw new Error("Passwords do not match");
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/*
  Generates a cryptographically secure 6-digit verification code with a 15-minute expiry.
  Used for email verification and similar flows.
*/
export function generateCode() {
  const code = crypto.randomInt(100000, 1000000).toString();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  return { code, expiry };
}
