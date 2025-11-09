import mongoose from 'mongoose';

const attendeeSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  name: { type: String },
  startAvailable: { type: Number },
  endAvailable: { type: Number }
});

export const AttendeeModel = mongoose.model('Attendee', attendeeSchema);
