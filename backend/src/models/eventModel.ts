import mongoose, { Schema, Document } from 'mongoose';

export interface Event extends Document {
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: number;
  endTime: number;
  organiserName: string;
}

const eventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  organiserName: { type: String, required: true },
});

export const EventModel = mongoose.model<Event>('Event', eventSchema);
