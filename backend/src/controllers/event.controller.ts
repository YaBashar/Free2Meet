import { Request, Response } from 'express';
import { createEvent, deleteEvent, eventDetails, inviteLink, updateEvent, getOrganisedEvents, getAttendingEvents, inviteDetails } from '../service/event.service';
import { UpdateEvents } from '../models/interfaces';

export const create = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, description, location, date, startTime, endTime } = req.body;

  try {
    const result = await createEvent(userId, title, description, location, date, startTime, endTime);
    res.status(200).json({ eventId: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const invite = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = await inviteLink(userId, eventId);
    res.status(200).json({ link: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getInviteDetails = async (req: Request, res: Response) => {
  const inviteLink = req.params.inviteLink as string;

  try {
    const result = await inviteDetails(inviteLink);
    res.status(200).json({ event: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;
  const updatedEventFields: UpdateEvents = req.body;
  const { title, description, location, date, startTime, endTime } = updatedEventFields;

  try {
    const result = await updateEvent(userId, eventId, title, description, location, date, startTime, endTime);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const info = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = await eventDetails(userId, eventId);
    res.status(200).json({ event: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = await deleteEvent(userId, eventId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const organisedEvents = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const result = await getOrganisedEvents(userId);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const attendingEvents = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const result = await getAttendingEvents(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
