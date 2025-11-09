import mongoose from 'mongoose';
import { EventInvite } from './interfaces';

const eventInviteSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  link: { type: String }
});

export const EventInviteModel = mongoose.model<EventInvite>('EventInvite', eventInviteSchema);
