import mongoose from 'mongoose';

const eventInviteSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  link: { type: String }
});

export const eventInviteModel = mongoose.model('EventInvite', eventInviteSchema);
