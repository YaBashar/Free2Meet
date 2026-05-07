import mongoose from 'mongoose';

export type EventParticipantStatus = "Pending" | "Accepted" | "Declined";

export interface EventParticipant extends Document {
  userId: string;
  eventId: string;
  name: string;
  startAvailable?: number;
  endAvailable?: number;
  status: EventParticipantStatus;
  inviteCode?: string;
  inviteCodeExpiry?: Date;
  role: "Organiser" | "Attendee"
}

const eventParticipantSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  name: { type: String },
  startAvailable: { type: Number },
  endAvailable: { type: Number },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined']},
  inviteCode: { type: String },
  inviteCodeExpiry: { type: Date },
  role: { type: String, enum: ['Organiser', 'Attendee']}
});

export const EventParticipantModel = mongoose.model('Attendee', eventParticipantSchema);
