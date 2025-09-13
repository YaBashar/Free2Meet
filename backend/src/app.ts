import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import config from './config.json';
import { setData } from './models/dataStore';
import { verifyJWT } from './middleware';

import { getClear, getEcho } from './controllers/other.controller';
import * as authController from './controllers/auth.controller';
import * as eventController from './controllers/event.controller';
import * as attendeeController from './controllers/attendee.controller';
// set up app
export const app = express();

app.use(cookieParser());

// Use middleware that allows us to access JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// For logging purposes
app.use(morgan('dev'));

const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
// Load data from file on startup
if (fs.existsSync('/data.json')) {
  const rawData = fs.readFileSync('/data.json', 'utf-8');
  setData(JSON.parse(rawData));
}
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file),
  { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

app.get('/echo', getEcho);
app.delete('/clear', getClear);

// Auth
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/refresh', authController.refresh);
app.post('/auth/request-reset', authController.requestReset);
app.post('/auth/reset-password', authController.resetPassword);
app.get('/auth/user-details', verifyJWT, authController.userInfo);
app.post('/auth/logout', verifyJWT, authController.logout);
app.put('/auth/change-password', verifyJWT, authController.changePassword);

// Events
app.post('/events/new-event', verifyJWT, eventController.create);
app.post('/events/:eventId/invite', verifyJWT, eventController.invite);
app.put('/events/:eventId', verifyJWT, eventController.update);
app.get('/events/:eventId', verifyJWT, eventController.info);
app.delete('/events/:eventId', verifyJWT, eventController.remove);

// Attendees
app.post('/attendees/respond', verifyJWT, attendeeController.respond);
app.put('/attendees/availability/:eventId', verifyJWT, attendeeController.availability);
app.delete('/attendees/leave/:eventId', verifyJWT, attendeeController.leave);
