import mongoose from 'mongoose';
import { Events } from './interfaces';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  organiser: { type: String },
  attendees: { type: [String], default: [] },
  notAttending: { type: [String], default: [] }
});

export const EventModel = mongoose.model<Events>('Event', eventSchema);
