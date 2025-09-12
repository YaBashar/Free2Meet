import { Request, Response } from 'express';
import { attendeeLeaveEvent, attendeeRespond, attendeeSelectAvailability } from '../service/attendee.service';

export const attendeeControllerRespond = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { inviteLink, action } = req.body;

  try {
    const result = attendeeRespond(userId, inviteLink, action);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const attendeeControllerAvailable = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;
  const { startAvailable, endAvailable } = req.body;

  try {
    const result = attendeeSelectAvailability(userId, eventId, startAvailable, endAvailable);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const attendeeControllerLeave = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = attendeeLeaveEvent(userId, eventId);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
