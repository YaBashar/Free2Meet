import mongoose, { Schema, Document } from "mongoose";

export const EventType = {
  SINGLE: "SINGLE_DAY", 
  MULTIPLE: "MULTI_DAY",
  HYBRID: "HYBRID",
}  as const;

export type EventType = (typeof EventType)[keyof typeof EventType]

export interface Event extends Document {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: number;
  endTime: number;
  organiserId: string;
  organiserName: string;
  eventType: EventType;
}

const eventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  organiserId: { type: String, required: true },
  organiserName: { type: String, required: true },
  eventType: { type: String, enum: ["SINGLE_DAY", "MULTI_DAY", "HYBRID"], required: true },
});

export const EventModel = mongoose.model<Event>("Event", eventSchema);
