import mongoose from "mongoose";
import { EventParticipantModel } from "../models/eventParticipantModel";
import { EventModel } from "../models/eventModel";
import { UserModel } from "../models/userModel";

export class AttendeeError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AttendeeError";
    this.statusCode = statusCode;
  }
}

export async function attendeeRespond(
  userId: string,
  inviteCode: string,
  action: string
): Promise<object> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AttendeeError("Invalid User ID");
  }

  const pendingRecord = await EventParticipantModel.findOne({
    inviteCode,
    status: "Pending",
    role: "Attendee",
  });

  if (!pendingRecord) {
    throw new AttendeeError("Invalid Invite Link");
  }

  if (pendingRecord.inviteCodeExpiry && pendingRecord.inviteCodeExpiry < new Date()) {
    throw new AttendeeError("Invite link has expired", 410);
  }

  const event = await EventModel.findById(pendingRecord.eventId);
  if (!event) {
    throw new AttendeeError("Event does not exist for invite link");
  }

  pendingRecord.userId = userId;
  pendingRecord.name = user.name;

  if (action === "accept") {
    pendingRecord.status = "Accepted";
    pendingRecord.startAvailable = -1;
    pendingRecord.endAvailable = -1;
  } else if (action === "reject") {
    pendingRecord.status = "Declined";
  }

  await pendingRecord.save();
  return {};
}

export async function attendeeSelectAvailability(
  userId: string,
  eventId: string,
  startTime: number,
  endTime: number
) {
  if (endTime <= startTime) {
    throw new AttendeeError("Invalid Availability Block");
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
    throw new AttendeeError("Attendee with userId is not part of this Event");
  }

  attendee.startAvailable = startTime;
  attendee.endAvailable = endTime;

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
