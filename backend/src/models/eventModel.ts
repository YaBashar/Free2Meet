import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  id: { type: String },
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

export const eventModel = mongoose.model('Event', eventSchema);
