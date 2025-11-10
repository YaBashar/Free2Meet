import mongoose from 'mongoose';

const declinedInviteSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  name: { type: String },
  declinedAt: { type: Date, default: Date.now }
});

export const DeclinedModel = mongoose.model('Declined', declinedInviteSchema);
