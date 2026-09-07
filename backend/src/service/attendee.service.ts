import mongoose from "mongoose";
import { EventParticipantModel } from "../models/eventParticipantModel";
import { EventModel, EventType } from "../models/eventModel";
import { UserModel } from "../models/userModel";
import { isValidInviteCode } from "../utils/eventHelper";
import { EventError } from "./event.service";

export class AttendeeError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AttendeeError";
    this.statusCode = statusCode;
  }
}

export async function attendeeJoin(userId: string, inviteCode: string): Promise<object> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AttendeeError("Invalid User ID");
  }

  if (!isValidInviteCode(inviteCode)) {
    throw new AttendeeError("Invalid Invite Code");
  }

  const pendingRecord = await EventParticipantModel.findOne({
    inviteCode,
    status: "Pending",
    role: "Attendee",
  });

  if (!pendingRecord) {
    throw new AttendeeError("Invalid Invite Code");
  }

  if (pendingRecord.inviteCodeExpiry && pendingRecord.inviteCodeExpiry < new Date()) {
    throw new AttendeeError("Invite code has expired", 410);
  }

  const event = await EventModel.findById(pendingRecord.eventId);
  if (!event) {
    throw new AttendeeError("Event does not exist for invite code");
  }

  pendingRecord.userId = userId;
  pendingRecord.name = user.name;
  pendingRecord.status = "Accepted";

  await pendingRecord.save();

  // Drop the share code after use so it cannot be replayed and can be reused later
  await EventParticipantModel.updateOne(
    { _id: pendingRecord._id },
    { $unset: { inviteCode: 1, inviteCodeExpiry: 1 } }
  );

  return {};
}

export async function attendeeSelectAvailability(
  userId: string,
  eventId: string,
  date: string,
  startAvailable: number,
  endAvailable: number
) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new AttendeeError("Invalid Event Id");
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new EventError("Event not found", 404);
  }

  const eventStart = event.startTime;
  const eventEnd = event.endTime;

  const attendee = await EventParticipantModel.findOne({
    userId,
    eventId,
    status: "Accepted",
    role: "Attendee",
  });
  if (!attendee) {
    throw new AttendeeError("Attendee with userId is not part of this Event");
  }

  if (isNaN(new Date(date).getTime())) {
    throw new AttendeeError("Invalid date format");
  }

  if (event.eventType === EventType.HYBRID) {
    throw new AttendeeError("Hybrid events must be locked to a date before selecting availability", 400);
  }

  if (event.eventType === EventType.SINGLE) {
    if (date !== event.startDate) {
      throw new AttendeeError("Invalid date", 400);
    }
  } else {
    if (date < event.startDate || date > event.endDate) {
      throw new AttendeeError("Date is outside event range", 400);
    }
  }

  if (startAvailable >= endAvailable) {
    throw new AttendeeError("Invalid selection", 400);
  }

  if (startAvailable < eventStart || endAvailable > eventEnd) {
    throw new AttendeeError("Invalid availability", 400);
  }

  const existingIndex = attendee.availability.findIndex((a) => a.date === date);
  if (existingIndex >= 0) {
    // Update — overwrite the existing entry for this date
    const existing = attendee.availability[existingIndex];
    existing.date = date;
    existing.startAvailable = startAvailable;
    existing.endAvailable = endAvailable;
  } else {
    // Insert — first time setting availability for this date
    attendee.availability.push({ date, startAvailable, endAvailable });
  }

  await attendee.save();
  return {};
}


export async function attendeeDayPreference(
  userId: string,
  eventId: string,
  preferredDates: string[]
) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new AttendeeError("Invalid Event Id");
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new EventError("Event not found", 404);
  }

  if (event.eventType !== EventType.HYBRID) {
    throw new AttendeeError("Day preference is only valid for hybrid events", 400);
  }

  const validatedDates: string[] = [];
  for (const item of preferredDates) {
    if (isNaN(new Date(item).getTime())) {
      throw new AttendeeError("Invalid date format");
    }
    if (item < event.startDate || item > event.endDate) {
      throw new AttendeeError("Date is outside event range", 400);
    }
    validatedDates.push(item);
  }

  const uniqueDates = [...new Set(validatedDates)];

  const attendee = await EventParticipantModel.findOne({
    userId,
    eventId,
    status: "Accepted",
    role: "Attendee",
  });
  if (!attendee) {
    throw new AttendeeError("Attendee with userId is not part of this Event");
  }

  attendee.preferredDates = uniqueDates;
  await attendee.save();
  return {};
}

export async function attendeeLeaveEvent(userId: string, eventId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AttendeeError("Invalid User ID");
  }

  if (!mongoose.isValidObjectId(eventId)) {
    throw new AttendeeError("Invalid Event Id");
  }

  const attendee = await EventParticipantModel.findOne({
    userId,
    eventId,
    status: "Accepted",
    role: "Attendee",
  });
  if (!attendee) {
    throw new AttendeeError("Attendee already left");
  }

  await attendee.deleteOne();

  return {};
}
