import crypto from "crypto";
import { checkEventConstraints, checkDateConstraints } from "../utils/eventHelper";
import { UserModel } from "../models/userModel";
import { EventModel, EventType } from "../models/eventModel";
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

const INVITE_CODE_MAX_ATTEMPTS = 10;

/** Cryptographically secure 6-digit share code, unique among all invite codes. */
async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < INVITE_CODE_MAX_ATTEMPTS; attempt++) {
    const inviteCode = crypto.randomInt(100000, 1000000).toString();
    const existing = await EventParticipantModel.findOne({ inviteCode }).select("_id");
    if (!existing) {
      return inviteCode;
    }
  }
  throw new EventError("Could not generate a unique invite code", 500);
}

interface PopulatedEventDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: number;
  endTime: number;
  organiserId: string;
  organiserName: string;
  eventType: EventType;
}

function formatEvent(event: PopulatedEventDoc) {
  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    location: event.location,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
    organiserId: event.organiserId,
    organiser: event.organiserName,
    eventType: event.eventType,
  };
}

export async function createEvent(
  userId: string,
  title: string,
  description: string,
  location: string,
  startDate: string,
  endDate: string,
  startTime: number,
  endTime: number,
  eventType: EventType
): Promise<string> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new EventError("Invalid User Id");
  }

  // Check for an existing event at the same location/date organised by this user
  const eventsAtLocationDate = await EventModel.find({ location, startDate, endDate });
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
    checkDateConstraints(eventType, startDate, endDate);
    checkEventConstraints(title, description, startTime, endTime);
  } catch (error) {
    throw new EventError(error instanceof Error ? error.message : String(error));
  }

  const newEvent = new EventModel({
    title,
    description,
    location,
    startDate,
    endDate,
    startTime,
    endTime,
    organiserId: userId,
    organiserName: user.name,
    eventType,
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
  if (!mongoose.isValidObjectId(eventId)) {
    throw new EventError("Invalid Event Id");
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new EventError("Invalid Event Id");
  }

  return formatEvent(event as unknown as PopulatedEventDoc & { id: string });
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
    throw new EventError(error instanceof Error ? error.message : String(error));
  }

  return {};
}

export async function inviteLink(
  userId: string,
  eventId: string,
  inviteeEmail?: string
): Promise<object> {
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

  const inviteCode = await generateUniqueInviteCode();

  // Expire at the end of the event's last day — invites for past events are meaningless
  const [year, month, day] = event.endDate.split("-").map(Number);
  const inviteCodeExpiry = new Date(year, month - 1, day, 23, 59, 59, 999);

  const pendingParticipant = new EventParticipantModel({
    eventId: event._id,
    role: "Attendee",
    status: "Pending",
    inviteCode,
    inviteCodeExpiry,
  });

  await pendingParticipant.save();

  // Email is optional — organisers can share the returned code in-app instead
  if (process.env.NODE_ENV !== "test" && inviteeEmail) {
    try {
      await sendEventInviteEmail(inviteeEmail, inviteCode, event.title, user.name);
    } catch {
      // Email delivery failure does not block invite creation
    }
  }

  // Always return the code so the organiser can share it (email, SMS, in-person)
  return { inviteCode };
}

export async function updateEvent(
  userId: string,
  eventId: string,
  title: string,
  description: string,
  location: string,
  startDate: string,
  endDate: string,
  startTime: number,
  endTime: number,
  eventType: EventType
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
    checkDateConstraints(eventType, startDate, endDate);
    checkEventConstraints(title, description, startTime, endTime);
  } catch (error) {
    throw new EventError(error instanceof Error ? error.message : String(error));
  }

  event.title = title;
  event.description = description;
  event.location = location;
  event.startDate = startDate;
  event.endDate = endDate;
  event.startTime = startTime;
  event.endTime = endTime;
  event.eventType = eventType;

  await event.save();
  return {};
}

export async function getOrganisedEvents(userId: string) {
  const events = await EventModel.find({ organiserId: userId }).lean();
  return {
    events: events.map((e) => formatEvent(e as unknown as PopulatedEventDoc & { id: string })),
  };
}

export async function getAllAttendingEventsForUser(userId: string) {
  const attendeeRecords = await EventParticipantModel.find({
    userId,
    role: "Attendee",
    status: "Accepted",
  }).select("eventId");

  const eventIds = attendeeRecords.map((r) => r.eventId);
  const events = await EventModel.find({ _id: { $in: eventIds } }).lean();
  return { events: events.map((e) => formatEvent(e as unknown as PopulatedEventDoc)) };
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
