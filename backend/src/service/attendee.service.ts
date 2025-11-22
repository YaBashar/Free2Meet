import { AttendeeModel } from '../models/attendeeModel';
import { DeclinedModel } from '../models/declinedInviteModel';
import { EventInviteModel } from '../models/eventInviteModel';
import { EventModel } from '../models/eventModel';
import { UserModel } from '../models/userModel';

async function attendeeRespond(userId: string, inviteLink: string, action: string): Promise<object> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error('Invalid User ID');
  }

  const invite = await EventInviteModel.findOne({ link: inviteLink });
  if (!invite) {
    throw new Error('Invalid Invite Link');
  }

  const event = await EventModel.findOne({ _id: invite.eventId });

  if (!event) {
    throw new Error('Event does not exist for invite link');
  }

  if (action === 'accept') {
    const attendee = new AttendeeModel({
      userId: user._id.toString(),
      eventId: event._id,
      name: user.name,
      startAvailable: -1,
      endAvailable: -1
    });
    await attendee.save();
  } else if (action === 'reject') {
    const declined = new DeclinedModel({
      userId: user._id.toString(),
      eventId: event._id,
      name: user.name,
      declinedAt: Date.now()
    });
    await declined.save();
  }

  return {};
}

async function attendeeSelectAvailability(userId: string, eventId: string, startTime: number, endTime: number) {
  if (endTime <= startTime) {
    throw new Error('Invalid Availability Block');
  }

  const attendee = await AttendeeModel.findOne({ userId: userId, eventId: eventId });
  if (!attendee) {
    throw new Error('Attendee with userId is not part of this Event');
  }

  attendee.startAvailable = startTime;
  attendee.endAvailable = endTime;

  await attendee.save();
  return {};
}

async function attendeeLeaveEvent(userId: string, eventId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('Invalid User ID');
  }

  const attendee = await AttendeeModel.findOne({ userId: userId, eventId: eventId });
  if (!attendee) {
    throw new Error('Attendee already left');
  }

  await attendee.deleteOne();

  return {};
}

export { attendeeRespond, attendeeSelectAvailability, attendeeLeaveEvent };
