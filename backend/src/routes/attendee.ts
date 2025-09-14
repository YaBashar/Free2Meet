import express from 'express';
import { verifyJWT } from '../middleware';
import * as attendeeController from '../controllers/attendee.controller';

export const attendeeRouter = express.Router();

attendeeRouter.post('/respond', verifyJWT, attendeeController.respond);
attendeeRouter.put('/availability/:eventId', verifyJWT, attendeeController.availability);
attendeeRouter.delete('/leave/:eventId', verifyJWT, attendeeController.leave);
