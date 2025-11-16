import express from 'express';
import { verifyJWT } from '../middleware';
import * as eventController from '../controllers/event.controller';

export const eventRouter = express.Router();

eventRouter.post('/new-event', verifyJWT, eventController.create);
eventRouter.get('/organised-events', verifyJWT, eventController.organisedEvents);
eventRouter.get('/attending-events', verifyJWT, eventController.allAttendingEventsForUser);
eventRouter.post('/:eventId/invite', verifyJWT, eventController.invite);
eventRouter.get('/invite/:inviteLink', eventController.inviteDetails);
eventRouter.put('/:eventId', verifyJWT, eventController.update);
eventRouter.get('/:eventId', verifyJWT, eventController.info);
eventRouter.get('/:eventId/attending', eventController.getEventAttendees);
eventRouter.get('/:eventId/notAttending', eventController.notAttending);
eventRouter.delete('/:eventId', verifyJWT, eventController.remove);
