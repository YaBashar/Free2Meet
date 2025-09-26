import crypto from 'crypto';
import { checkEventConstraints } from '../utils/eventHelper';
import { UserModel } from '../models/userModel';
import { EventModel } from '../models/eventModel';
import { EventInviteModel } from '../models/eventInviteModel';
import { Events } from '../models/interfaces';

// TODO Future
// Handling Multiple Dates and Timings ie 1 week range.

async function createEvent(userId: string, title: string, description: string, location: string, date: string, startTime: number, endTime: number): Promise<string> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error('Invalid User Id');
  }

  const event = await EventModel.findOne({ location: location, date: date, orgainser: user.name });
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
    attendees: [],
    notAttending: []
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
    attendees: event.attendees,
    notAttending: event.notAttending
  };
}

async function deleteEvent(userId: string, eventId: string): Promise<object> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('Invalid User Id');
  }

  try {
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

  // Atm invites are public, might need another endpoint for private invites
  const invite = new EventInviteModel({
    eventId: event._id,
    link: crypto.randomBytes(32).toString('hex')
  });

  await invite.save();
  return invite.link;
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

export { createEvent, deleteEvent, eventDetails, inviteLink, updateEvent };
