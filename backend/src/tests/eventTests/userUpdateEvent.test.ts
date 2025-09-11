import request from 'sync-request-curl';
import { port, url } from '../../config.json';
import { UpdateEvents } from '../../interfaces';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let eventId: string;
let updatedFields: UpdateEvents;
beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
  requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
  const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
  const data = JSON.parse(res.body.toString());
  token = data.token;

  const res1 = requestNewEvent(token, 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
  const data1 = JSON.parse(res1.body.toString());
  eventId = data1.eventId;

  updatedFields = {
    title: 'Different Event',
    description: 'Different Description',
    location: 'Different House',
    date: '31/08/2025',
    startTime: 10,
    endTime: 14
  };
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
});

describe('Error Cases', () => {
  test('Invalid UserId Token', () => {
    const res = requestEventUpdate('InvalidToken', eventId, updatedFields);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid EventID', () => {
    const res = requestEventUpdate(token, 'InvalidEventId', updatedFields);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test('Successful Return type', () => {
    const res = requestEventUpdate(token, eventId, updatedFields);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Successfully Updated', () => {
    requestEventUpdate(token, eventId, updatedFields);
    const res = requestEventDetails(token, eventId);
    const data = JSON.parse(res.body.toString());
    expect(data.event).toStrictEqual({
      id: eventId,
      title: 'Different Event',
      description: 'Different Description',
      location: 'Different House',
      date: '31/08/2025',
      startTime: 10,
      endTime: 14,
      organiser: 'Mubashir Hussain',
      attendees: [],
      notAttending: []
    });

    expect(res.statusCode).toStrictEqual(200);
  });
});

const requestAuthRegister = (firstName: string, lastName: string, password: string, email: string) => {
  return (request('POST', SERVER_URL + '/auth/register', {
    json: { firstName, lastName, password, email }, timeout: TIMEOUT_MS
  }));
};

const requestAuthLogin = (email: string, password: string) => {
  return (request('POST', SERVER_URL + '/auth/login', {
    json: { email, password }, timeout: TIMEOUT_MS
  }));
};

const requestNewEvent = (token: string, title: string, description: string, location: string, date: string, startTime: number, endTime: number) => {
  return (request('POST', SERVER_URL + '/events/new-event', {
    headers: { Authorization: `Bearer ${token}` },
    json: { title, description, location, date, startTime, endTime },
    timeout: TIMEOUT_MS
  }));
};

const requestEventUpdate = (token: string, eventId: string, updatedFields: UpdateEvents) => {
  return (request('PUT', SERVER_URL + `/events/update-event/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    json: updatedFields,
    timeout: TIMEOUT_MS
  }));
};

const requestEventDetails = (token: string, eventId: string) => {
  return (request('GET', SERVER_URL + `/events/event-details/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};
