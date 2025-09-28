import { Request, Response } from 'express';
import { attendeeLeaveEvent, attendeeRespond, attendeeSelectAvailability } from '../service/attendee.service';

export const respond = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { inviteLink, action } = req.body;

  try {
    const result = await attendeeRespond(userId, inviteLink, action);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const availability = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;
  const { startAvailable, endAvailable } = req.body;

  try {
    const result = await attendeeSelectAvailability(userId, eventId, startAvailable, endAvailable);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const leave = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = await attendeeLeaveEvent(userId, eventId);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
