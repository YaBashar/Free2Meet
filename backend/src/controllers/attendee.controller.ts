import { Request, Response, NextFunction } from "express";
import {
  attendeeDayPreference,
  AttendeeError,
  attendeeJoin,
  attendeeLeaveEvent,
  attendeeSelectAvailability,
} from "../service/attendee.service";

export const join = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  // Prefer inviteCode; inviteLink kept for older clients
  const inviteCode = (req.body.inviteCode ?? req.body.inviteLink) as string;

  try {
    const result = await attendeeJoin(userId, inviteCode);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const availability = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  const eventId = req.params.eventId as string;
  const { date, startAvailable, endAvailable } = req.body;

  try {
    const result = await attendeeSelectAvailability(
      userId,
      eventId,
      date,
      startAvailable,
      endAvailable
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const dayPreference = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.sub;
  const eventId = req.params.eventId as string;
  const { preferredDates } = req.body;

  try {
    if (!Array.isArray(preferredDates)) {
      throw new AttendeeError("preferredDates must be an array");
    }
    const dates: string[] = [];
    for (const item of preferredDates) {
      if (typeof item !== "string") {
        throw new AttendeeError("Invalid date format");
      }
      dates.push(item);
    }

    const result = await attendeeDayPreference(userId, eventId, dates);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const leave = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  const eventId = req.params.eventId as string;

  try {
    const result = await attendeeLeaveEvent(userId, eventId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
