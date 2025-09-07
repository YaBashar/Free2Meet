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
import { setData } from './dataStore';
import { echo, clear } from './other';
import { registerUser, userLogin, requestResetPasswd, setResetPassword, authRefresh, userDetails, userLogout, userChangePasswords } from './auth';
import { createEvent, deleteEvent, eventDetails, inviteLink, updateEvent } from './event';
import { verifyJWT } from './middleware';
import { UpdateEvents } from './interfaces';
import { attendeeRespond } from './attendees';
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

// ====================================================================
// ====================================================================

// Example Get Request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }
  return res.json(result);
});

app.delete('/clear', (req: Request, res: Response) => {
  const result = clear();
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/auth/register', (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const result = registerUser(firstName, lastName, password, email);
    res.json({ userId: result }).status(200);
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { accessToken, refreshToken } = userLogin(email, password);
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ token: accessToken }).status(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/auth/refresh', (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ error: 'Unauthorised' });

  const refreshToken = cookies.jwt;

  try {
    const result = authRefresh(refreshToken);
    res.json({ token: result }).status(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/auth/request-reset', (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = requestResetPasswd(email);
    res.json({ resetToken: result }).status(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/auth/reset-password', (req: Request, res: Response) => {
  const { userId, token, newPassword, confirmNewPasswd } = req.body;

  try {
    const result = setResetPassword(userId, token, newPassword, confirmNewPasswd);
    res.json({ userId: result }).status(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/auth/user-details', verifyJWT, (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const result = userDetails(userId);
    res.json({ user: result }).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/logout', verifyJWT, (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ error: 'Cookie does not contain refresh token' });
  const refreshToken = cookies.jwt;

  try {
    const result = userLogout(refreshToken, userId);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/auth/change-password', verifyJWT, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { currentPassword, newPassword, confirmNewPasswd } = req.body;

  try {
    const result = userChangePasswords(userId, currentPassword, newPassword, confirmNewPasswd);
    console.log(result);
    res.json({ userId: result }).status(200);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/events/new-event', verifyJWT, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, description, location, date, startTime, endTime } = req.body;

  try {
    const result = createEvent(userId, title, description, location, date, startTime, endTime);
    res.json({ eventId: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/events/invite/:eventId', verifyJWT, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = inviteLink(userId, eventId);
    res.json({ link: result }).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/events/update-event/:eventId', verifyJWT, (req: Request, res: Response) => {
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
});

app.get('/events/event-details/:eventId', verifyJWT, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = eventDetails(userId, eventId);
    res.json({ event: result }).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/events/delete-event/:eventId', verifyJWT, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.eventId as string;

  try {
    const result = deleteEvent(userId, eventId);
    console.log(result);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/attendees/accept', verifyJWT, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { inviteLink, action } = req.body;

  try {
    const result = attendeeRespond(userId, inviteLink, action);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
