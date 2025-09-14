import express from 'express';
import { verifyJWT } from '../middleware';
import * as eventController from '../controllers/event.controller';

export const eventRouter = express.Router();

eventRouter.post('/new-event', verifyJWT, eventController.create);
eventRouter.post('/:eventId/invite', verifyJWT, eventController.invite);
eventRouter.put('/:eventId', verifyJWT, eventController.update);
eventRouter.get('/:eventId', verifyJWT, eventController.info);
eventRouter.delete('/:eventId', verifyJWT, eventController.remove);
