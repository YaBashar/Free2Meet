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
import { authControllerLogin, authControllerLogout, authControllerRefresh, authControllerRegister, authControllerRequestReset, authControllerResetPasswd, authControllerUserChangePasswd, authControllerUserDetails } from './controllers/auth.controller';
import { eventControllerCreate, eventControllerDelete, eventControllerDetails, eventControllerInvite, eventControllerUpdate } from './controllers/event.controller';
import { attendeeControllerAvailable, attendeeControllerLeave, attendeeControllerRespond } from './controllers/attendee.controller';
// set up app
const app = express();

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

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = (process.env.IP || '127.0.0.1');

// ====================================================================
// ====================================================================

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${PORT}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});

app.get('/echo', getEcho);
app.delete('/clear', getClear);

app.post('/auth/register', authControllerRegister);
app.post('/auth/login', authControllerLogin);
app.post('/auth/refresh', authControllerRefresh);
app.post('/auth/request-reset', authControllerRequestReset);
app.post('/auth/reset-password', authControllerResetPasswd);

// Send UserId in url
app.get('/auth/user-details', verifyJWT, authControllerUserDetails);
app.post('/auth/logout', verifyJWT, authControllerLogout);
app.put('/auth/change-password', verifyJWT, authControllerUserChangePasswd);

// Events
app.post('/events/new-event', verifyJWT, eventControllerCreate);
app.post('/events/:eventId/invite', verifyJWT, eventControllerInvite);
app.put('/events/:eventId', verifyJWT, eventControllerUpdate);
app.get('/events/:eventId', verifyJWT, eventControllerDetails);
app.delete('/events/:eventId', verifyJWT, eventControllerDelete);

// Attendees
app.post('/attendees/respond', verifyJWT, attendeeControllerRespond);
app.put('/attendees/availability/:eventId', verifyJWT, attendeeControllerAvailable);
app.delete('/attendees/leave/:eventId', verifyJWT, attendeeControllerLeave);
