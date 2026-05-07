import { Request, Response, NextFunction } from 'express';
import { attendeeLeaveEvent, attendeeRespond, attendeeSelectAvailability } from '../service/attendee.service';

export const respond = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  const { inviteLink, action } = req.body;

  try {
    const result = await attendeeRespond(userId, inviteLink, action);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const availability = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;
  const eventId = req.params.eventId as string;
  const { startAvailable, endAvailable } = req.body;

  try {
    const result = await attendeeSelectAvailability(userId, eventId, startAvailable, endAvailable);
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
