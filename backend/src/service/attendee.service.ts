import { AttendeeModel } from '../models/attendeeModel';
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
    // also change user model
    user.attendingEvents.push(event._id);
    await user.save();

    // remove;
    // event.attendees.push(user.name);
    // await event.save();

    const attendee = new AttendeeModel({
      userId: user._id.toString(),
      eventId: event._id,
      name: user.name,
      startAvailable: -1,
      endAvailable: -1
    });

    await attendee.save();
  } else if (action === 'reject') {
    // Decide whether to keep rejections
  }

  return {};
}

// TODO : fix
async function attendeeSelectAvailability(userId: string, eventId: string, startTime: number, endTime: number) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('Invalid User ID');
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new Error('Invalid Event ID');
  }

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

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new Error('Invalid Event ID');
  }

  const attendee = await AttendeeModel.findOne({ userId: userId, eventId: eventId });
  if (!attendee) {
    throw new Error('Attendee already left');
  }

  user.attendingEvents = user.attendingEvents.filter((e) => e.toString() !== eventId);
  event.attendees = event.attendees.filter((name: string) => name !== attendee.name);
  event.notAttending.push(user.name);

  await user.save();
  await event.save();
  await attendee.deleteOne();

  return {};
}

export { attendeeRespond, attendeeSelectAvailability, attendeeLeaveEvent };
