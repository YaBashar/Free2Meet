import { Request, Response } from 'express';
import { createEvent, deleteEvent, eventDetails, inviteLink, updateEvent } from '../service/event.service';
import { UpdateEvents } from '../models/interfaces';

export const create = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, description, location, date, startTime, endTime } = req.body;

  try {
    const result = createEvent(userId, title, description, location, date, startTime, endTime);
    res.json({ eventId: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const invite = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = inviteLink(userId, eventId);
    res.json({ link: result }).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const update = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;
  const updatedEventFields: UpdateEvents = req.body;
  const { title, description, location, date, startTime, endTime } = updatedEventFields;

  try {
    const result = updateEvent(userId, eventId, title, description, location, date, startTime, endTime);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const info = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = eventDetails(userId, eventId);
    res.json({ event: result }).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const remove = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = deleteEvent(userId, eventId);
    console.log(result);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
