import { Request, Response, NextFunction } from 'express';
import { createEvent, deleteEvent, eventDetails, inviteLink, updateEvent, getOrganisedEvents, getAllAttendingEventsForUser, getInviteDetails, getNotAttending, getAttendeesForEvent } from '../service/event.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  const { title, description, location, date, startTime, endTime } = req.body;

  try {
    const result = await createEvent(userId, title, description, location, date, startTime, endTime);
    res.status(200).json({ eventId: result });
  } catch (error) {
    next(error);
  }
};

export const invite = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  const eventId = req.params.eventId as string;
  const { inviteeEmail } = req.body;

  try {
    const result = await inviteLink(userId, eventId, inviteeEmail);
    res.status(200).json({ link: result });
  } catch (error) {
    next(error);
  }
};

export const inviteDetails = async (req: Request, res: Response, next: NextFunction) => {
  const link = req.params.inviteLink as string;

  try {
    const result = await getInviteDetails(link);
    res.status(200).json({ event: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  const eventId = req.params.eventId as string;
  const { title, description, location, date, startTime, endTime } = req.body;

  try {
    const result = await updateEvent(userId, eventId, title, description, location, date, startTime, endTime);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const info = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  const eventId = req.params.eventId as string;

  try {
    const result = await eventDetails(userId, eventId);
    res.status(200).json({ event: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  const eventId = req.params.eventId as string;

  try {
    const result = await deleteEvent(userId, eventId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const organisedEvents = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;

  try {
    const result = await getOrganisedEvents(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const allAttendingEventsForUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;

  try {
    const result = await getAllAttendingEventsForUser(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const notAttending = async (req: Request, res: Response, next: NextFunction) => {
  const eventId = req.params.eventId as string;

  try {
    const result = await getNotAttending(eventId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEventAttendees = async (req: Request, res: Response, next: NextFunction) => {
  const eventId = req.params.eventId as string;

  try {
    const result = await getAttendeesForEvent(eventId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
