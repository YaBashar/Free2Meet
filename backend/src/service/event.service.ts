import crypto from 'crypto';
import { checkEventConstraints } from '../utils/eventHelper';
import { UserModel } from '../models/userModel';
import { EventModel } from '../models/eventModel';
import { EventInviteModel } from '../models/eventInviteModel';
import { Events } from '../models/interfaces';
import { AttendeeModel } from '../models/attendeeModel';
import { DeclinedModel } from '../models/declinedInviteModel';

// TODO Future
// Handling Multiple Dates and Timings ie 1 week range.

async function createEvent(userId: string, title: string, description: string, location: string, date: string, startTime: number, endTime: number): Promise<string> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error('Invalid User Id');
  }

  const event = await EventModel.findOne({ location: location, date: date, organiser: user.name });
  if (event) {
    throw new Error('Event already exists');
  }

  try {
    checkEventConstraints(title, description, startTime, endTime);
  } catch (error) {
    throw new Error(error.message);
  }

  const eventId = Date.now().toString();
  const newEvent = new EventModel({
    id: eventId,
    title: title,
    description: description,
    location: location,
    date: date,
    startTime: startTime,
    endTime: endTime,
    organiser: user.name,
  });

  await newEvent.save();
  return newEvent._id.toString();
}

async function eventDetails(userId: string, eventId: string): Promise<Events> {
  const user = (await UserModel.findById(userId));

  if (!user) {
    throw new Error('Invalid User Id');
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new Error('Invalid Event Id');
  }

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    organiser: event.organiser,
  };
}

async function deleteEvent(userId: string, eventId: string): Promise<object> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('Invalid User Id');
  }

  try {
    await AttendeeModel.deleteMany({ eventId: eventId });
    await EventModel.findByIdAndDelete(eventId);
  } catch (error) {
    throw new Error(error.message);
  }

  return {};
}

async function inviteLink(userId: string, eventId: string): Promise<string> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('Invalid User Id');
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new Error('Invalid Event Id');
  }

  const existingInvite = await EventInviteModel.findOne({ eventId: event._id });
  let inviteLink;

  if (existingInvite) {
    inviteLink = existingInvite.link;
  } else {
    const invite = new EventInviteModel({
      eventId: event._id,
      link: crypto.randomBytes(32).toString('hex')
    });

    await invite.save();
    inviteLink = invite.link;
  }

  return inviteLink;
}

async function getInviteDetails(inviteLink: string) {
  const invite = await EventInviteModel.findOne({ link: inviteLink });

  if (!invite) {
    throw new Error('Invalid Invite Link');
  }

  const eventId = invite.eventId;
  const event = await EventModel.findById(eventId);

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    organiser: event.organiser,
  };
}

async function updateEvent(userId: string, eventId: string, title: string, description: string, location: string, date: string, startTime: number, endTime: number) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('Invalid User Id');
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new Error('Invalid Event Id');
  }

  try {
    checkEventConstraints(title, description, startTime, endTime);
  } catch (error) {
    throw new Error(error.message);
  }

  event.title = title;
  event.description = description;
  event.location = location;
  event.date = date;
  event.startTime = startTime;
  event.endTime = endTime;

  await event.save();
  return {};
}

async function getOrganisedEvents(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('Invalid User Id');
  }

  const organiser = user.name;
  const events = await EventModel.find({ organiser: organiser });

  const cleanEvents = events.map(event => ({
    eventId: event._id.toString(),
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    organiser: event.organiser,
  }));

  return { events: cleanEvents };
}

async function getAllAttendingEventsForUser(userId: string) {
  const attendeeRecoards = await AttendeeModel
    .find({ userId: userId })
    .populate({
      path: 'eventId',
      select: 'title description location date startTime endTime organiser'
    })
    .lean();

  const events = attendeeRecoards
    .filter(record => record.eventId != null)
    .map(record => record.eventId)
    .map(({ _id, ...event }) => ({
      eventId: _id.toString(),
      ...event
    }));

  return { events: events };
}

async function getNotAttending(eventId: string) {
  const attendeeRecords = await DeclinedModel.find({ eventId: eventId }).select('name declinedAt -_id');
  return attendeeRecords;
}

async function getAttendeesForEvent(eventId: string) {
  const attendeeRecords = await AttendeeModel.find({ eventId: eventId }).select('name -_id');
  return attendeeRecords;
}

export { createEvent, deleteEvent, eventDetails, inviteLink, getInviteDetails, updateEvent, getOrganisedEvents, getAllAttendingEventsForUser, getNotAttending, getAttendeesForEvent };
