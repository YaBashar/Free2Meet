import crypto from "crypto";
import { checkEventConstraints } from "../utils/eventHelper";
import { UserModel } from "../models/userModel";
import { EventModel } from "../models/eventModel";
import { EventParticipantModel } from "../models/eventParticipantModel";
import { sendEventInviteEmail } from "./email.service";
import mongoose from "mongoose";

export class EventError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "EventError";
    this.statusCode = statusCode;
  }
}

interface PopulatedEventDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: number;
  endTime: number;
  organiserName: string;
}

interface LeanParticipantWithEvent {
  eventId: PopulatedEventDoc | null;
  name: string;
}

// TODO Future
// Handling Multiple Dates and Timings ie 1 week range.

export async function createEvent(
  userId: string,
  title: string,
  description: string,
  location: string,
  date: string,
  startTime: number,
  endTime: number
): Promise<string> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new EventError("Invalid User Id");
  }

  // Check for an existing event at the same location/date organised by this user
  const eventsAtLocationDate = await EventModel.find({ location, date });
  for (const existing of eventsAtLocationDate) {
    const organiserRecord = await EventParticipantModel.findOne({
      eventId: existing._id,
      userId,
      role: "Organiser",
    });
    if (organiserRecord) {
      throw new EventError("Event already exists");
    }
  }

  try {
    checkEventConstraints(title, description, startTime, endTime);
  } catch (error) {
    throw new EventError(error.message);
  }

  const newEvent = new EventModel({
    title,
    description,
    location,
    date,
    startTime,
    endTime,
    organiserName: user.name,
  });

  await newEvent.save();

  const organiserParticipant = new EventParticipantModel({
    userId,
    eventId: newEvent._id,
    name: user.name,
    role: "Organiser",
    status: "Accepted",
  });

  await organiserParticipant.save();

  return newEvent._id.toString();
}

export async function eventDetails(userId: string, eventId: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new EventError("Invalid User Id");
  }

  if (!mongoose.isValidObjectId(eventId)) {
    throw new EventError("Invalid Event Id");
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new EventError("Invalid Event Id");
  }

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    organiser: event.organiserName,
  };
}

export async function deleteEvent(userId: string, eventId: string): Promise<object> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new EventError("Invalid User Id");
  }

  try {
    await EventParticipantModel.deleteMany({ eventId });
    await EventModel.findByIdAndDelete(eventId);
  } catch (error) {
    throw new EventError(error.message);
  }

  return {};
}

export async function inviteLink(
  userId: string,
  eventId: string,
  inviteeEmail: string
): Promise<string> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new EventError("Invalid User Id");
  }

  if (!mongoose.isValidObjectId(eventId)) {
    throw new EventError("Invalid Event Id");
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new EventError("Invalid Event Id");
  }

  const organiserRecord = await EventParticipantModel.findOne({
    eventId: event._id,
    userId,
    role: "Organiser",
  });
  if (!organiserRecord) {
    throw new EventError("User is not the organiser of this event", 403);
  }

  const inviteCode = crypto.randomBytes(32).toString("hex");

  // Expire at the end of the event day — invites for past events are meaningless
  const [day, month, year] = event.date.split("/").map(Number);
  const inviteCodeExpiry = new Date(year, month - 1, day, 23, 59, 59, 999);

  const pendingParticipant = new EventParticipantModel({
    eventId: event._id,
    role: "Attendee",
    status: "Pending",
    inviteCode,
    inviteCodeExpiry,
  });

  await pendingParticipant.save();

  try {
    await sendEventInviteEmail(inviteeEmail, inviteCode, event.title, user.name);
  } catch {
    // Email delivery failure does not block invite creation
  }

  return inviteCode;
}

export async function getInviteDetails(inviteCode: string) {
  const pendingRecord = await EventParticipantModel.findOne({ inviteCode, role: "Attendee" });

  if (!pendingRecord) {
    throw new EventError("Invalid Invite Link");
  }

  const event = await EventModel.findById(pendingRecord.eventId);
  if (!event) {
    throw new EventError("Event not found");
  }

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    organiser: event.organiserName,
  };
}

export async function updateEvent(
  userId: string,
  eventId: string,
  title: string,
  description: string,
  location: string,
  date: string,
  startTime: number,
  endTime: number
) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new EventError("Invalid User Id");
  }

  if (!mongoose.isValidObjectId(eventId)) {
    throw new EventError("Invalid Event Id");
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new EventError("Invalid Event Id");
  }

  try {
    checkEventConstraints(title, description, startTime, endTime);
  } catch (error) {
    throw new EventError(error.message);
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

export async function getOrganisedEvents(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new EventError("Invalid User Id");
  }

  const organiserRecords = (await EventParticipantModel.find({ userId, role: "Organiser" })
    .populate({
      path: "eventId",
      select: "title description location date startTime endTime organiserName",
    })
    .lean()) as unknown as LeanParticipantWithEvent[];

  const events = organiserRecords
    .filter((record) => record.eventId != null)
    .map((record) => ({
      eventId: record.eventId._id.toString(),
      title: record.eventId.title,
      description: record.eventId.description,
      location: record.eventId.location,
      date: record.eventId.date,
      startTime: record.eventId.startTime,
      endTime: record.eventId.endTime,
      organiser: record.eventId.organiserName,
    }));

  return { events };
}

export async function getAllAttendingEventsForUser(userId: string) {
  const attendeeRecords = (await EventParticipantModel.find({
    userId,
    role: "Attendee",
    status: "Accepted",
  })
    .populate({
      path: "eventId",
      select: "title description location date startTime endTime organiserName",
    })
    .lean()) as unknown as LeanParticipantWithEvent[];

  const events = attendeeRecords
    .filter((record) => record.eventId != null)
    .map((record) => ({
      eventId: record.eventId._id.toString(),
      title: record.eventId.title,
      description: record.eventId.description,
      location: record.eventId.location,
      date: record.eventId.date,
      startTime: record.eventId.startTime,
      endTime: record.eventId.endTime,
      organiser: record.eventId.organiserName,
    }));

  return { events };
}

export async function getNotAttending(eventId: string) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new EventError("Invalid Event Id");
  }

  const declinedRecords = await EventParticipantModel.find({ eventId, status: "Declined" }).select(
    "name -_id"
  );
  return declinedRecords;
}

export async function getAttendeesForEvent(eventId: string) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new EventError("Invalid Event Id");
  }

  const attendeeRecords = await EventParticipantModel.find({
    eventId,
    status: "Accepted",
    role: "Attendee",
  }).select("name -_id");
  return attendeeRecords;
}
