import mongoose from 'mongoose';

const attendeeSchema = new mongoose.Schema({
  userId: { type: String },
  eventId: { type: String },
  name: { type: String },
  startAvailable: { type: Number },
  endAvailable: { type: Number }
});

export const AttendeeModel = mongoose.model('Attendee', attendeeSchema);
