import mongoose from "mongoose";


export type EventParticipantStatus = "Pending" | "Accepted" | "Declined";

export interface EventParticipant extends Document {
  userId: string;
  eventId: string;
  name: string;
  availability?: { date: string; startAvailable: number; endAvailable: number }[];
  preferredDates?: string[];
  status: EventParticipantStatus;
  inviteCode?: string;
  inviteCodeExpiry?: Date;
  role: "Organiser" | "Attendee";
}

const eventParticipantSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", index: true },
  name: { type: String },
  availability: [{ date: String, startAvailable: Number, endAvailable: Number }],
  preferredDates: [{ type: String }],
  status: { type: String, enum: ["Pending", "Accepted", "Declined"] },
  inviteCode: { type: String },
  inviteCodeExpiry: { type: Date },
  role: { type: String, enum: ["Organiser", "Attendee"] },
});

export const EventParticipantModel = mongoose.model("Attendee", eventParticipantSchema);
