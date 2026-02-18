import express, { json } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDoc = YAML.load('./swagger.yaml');

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
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// For logging purposes
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.delete('/clear', getClear);

app.use('/auth', authRouter);
app.use('/events', eventRouter);
app.use('/attendees', attendeeRouter);
