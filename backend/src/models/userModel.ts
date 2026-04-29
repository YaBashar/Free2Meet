import mongoose, { Document } from "mongoose";

export interface User extends Document {
  id: string;
  name: string;
  password: string;
  email: string;
  loginAttempts: number;
  lockUntil?: Date;
  accountLocked: boolean;
  verificationCode?: string | null;
  verificationCodeExpiry?: Date | null;
  resetCode?: string | null;
  resetCodeExpiry?: Date | null;
  emailVerified: boolean;
  accountExpiresAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  numSuccessfulLogins: number;
  numfailedSinceLastLogin: number;
  passwordHistory: string[];
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    accountLocked: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpiry: { type: Date },
    resetCode: { type: String },
    resetCodeExpiry: { type: Date },
    emailVerified: { type: Boolean, default: false },
    accountExpiresAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<User>("User", userSchema);
