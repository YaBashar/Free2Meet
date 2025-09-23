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

import { getClear } from './controllers/clear.controller';
import { authRouter } from './routes/auth';
import { eventRouter } from './routes/event';
import { attendeeRouter } from './routes/attendee';
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

app.delete('/clear', getClear);

app.use('/auth', authRouter);
app.use('/events', eventRouter);
app.use('/attendees', attendeeRouter);
