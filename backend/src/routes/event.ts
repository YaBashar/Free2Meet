import express from 'express';
import { requireAuth } from '../middleware';
import * as eventController from '../controllers/event.controller';

export const eventRouter = express.Router();

eventRouter.post('/new-event', requireAuth, eventController.create);
eventRouter.get('/organised-events', requireAuth, eventController.organisedEvents);
eventRouter.get('/attending-events', requireAuth, eventController.allAttendingEventsForUser);
eventRouter.post('/:eventId/invite', requireAuth, eventController.invite);
eventRouter.get('/invite/:inviteLink', eventController.inviteDetails);
eventRouter.put('/:eventId', requireAuth, eventController.update);
eventRouter.get('/:eventId', requireAuth, eventController.info);
eventRouter.get('/:eventId/attending', eventController.getEventAttendees);
eventRouter.get('/:eventId/notAttending', eventController.notAttending);
eventRouter.delete('/:eventId', requireAuth, eventController.remove);
