import mongoose from 'mongoose';
import { Users } from './interfaces';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  numSuccessfulLogins: { type: Number, default: 0 },
  numfailedSinceLastLogin: { type: Number, default: 0 },
  passwordHistory: { type: [String], default: [] },
  refreshTokens: { type: [String], default: [] },
  resetToken: {
    token: { type: String, unique: true },
    expiresAt: { type: Number }
  },
  organisedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  attendingEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

export const UserModel = mongoose.model<Users>('User', userSchema);
