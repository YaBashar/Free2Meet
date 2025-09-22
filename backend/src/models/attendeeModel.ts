import mongoose from 'mongoose';

const attendeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  name: { type: String },
  startAvailable: { type: Number },
  endAvailable: { type: Number }
});

export const attendeeModel = mongoose.model('Attendee', attendeeSchema);
