import express, { json, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import path from 'path';
import fs from 'fs';

import { getClear } from './controllers/clear.controller';
import { authRouter } from './routes/auth';
import { eventRouter } from './routes/event';
import { attendeeRouter } from './routes/attendee';
import { AuthError } from './service/auth.service';
// set up app
export const app = express();

app.use(cookieParser());

// Use middleware that allows us to access JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// For logging purposes
app.use(morgan('dev'));

const swaggerFile = fs.readFileSync(path.join(__dirname, '../swagger.yaml'), 'utf8');
const swaggerDoc = YAML.parse(swaggerFile);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.delete('/clear', getClear);

app.use('/auth', authRouter);
app.use('/events', eventRouter);
app.use('/attendees', attendeeRouter);

// eslint-disable-next-line no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  // Fallback to 500 if doesnt match any other type of error
  return res.status(500).json({ error: "Internal Server Error" });
});