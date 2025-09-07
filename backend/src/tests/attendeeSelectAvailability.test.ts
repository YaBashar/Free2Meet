import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let organiserToken: string;
let attendeeToken: string;
let link: string;
let eventId: string;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });

  requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
  const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
  const data = JSON.parse(res.body.toString());
  organiserToken = data.token;

  const res1 = requestNewEvent(organiserToken, 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
  const data1 = JSON.parse(res1.body.toString());
  eventId = data1.eventId;

  const res2 = requestEventInvite(organiserToken, eventId);
  const data2 = JSON.parse(res2.body.toString());
  link = data2.link;

  requestAuthRegister('Jonathan', 'Lee', 'Abcnmop.123$', 'jonl@gmail.com');
  const res3 = requestAuthLogin('jonl@gmail.com', 'Abcnmop.123$');
  const data3 = JSON.parse(res3.body.toString());
  attendeeToken = data3.token;
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
});

describe('Error Cases', () => {
  test('Invalid User ID', () => {
    requestAttendeeRespond(attendeeToken, link, 'accept');
    const res = requestAttendeeSelectAvail('invalid', eventId, 10, 12);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid Event ID', () => {
    requestAttendeeRespond(attendeeToken, link, 'accept');
    const res = requestAttendeeSelectAvail(attendeeToken, 'invalid', 10, 12);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid Availability', () => {
    requestAttendeeRespond(attendeeToken, link, 'accept');
    const res = requestAttendeeSelectAvail(attendeeToken, eventId, 10, 10);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Attendee not part of Event', () => {
    requestAttendeeRespond(attendeeToken, link, 'reject');
    const res = requestAttendeeSelectAvail(attendeeToken, eventId, 10, 12);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test('Success', () => {
    requestAttendeeRespond(attendeeToken, link, 'accept');
    const res = requestAttendeeSelectAvail(attendeeToken, eventId, 10, 12);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({});
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

const requestEventInvite = (token: string, eventId: string) => {
  return (request('POST', SERVER_URL + `/events/invite/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};

const requestNewEvent = (token: string, title: string, description: string, location: string, date: string, startTime: number, endTime: number) => {
  return (request('POST', SERVER_URL + '/events/new-event', {
    headers: { Authorization: `Bearer ${token}` },
    json: { title, description, location, date, startTime, endTime },
    timeout: TIMEOUT_MS
  }));
};

const requestAttendeeRespond = (token: string, inviteLink: string, action: string) => {
  return (request('POST', SERVER_URL + '/attendees/accept', {
    headers: { authorization: `Bearer ${token}` },
    json: { inviteLink, action }
  }));
};

const requestAttendeeSelectAvail = (token: string, eventId: string, startAvailable: number, endAvailable: number) => {
  return (request('PUT', SERVER_URL + `/attendees/availability/${eventId}`, {
    headers: { authorization: `Bearer ${token}` },
    json: { startAvailable, endAvailable }
  }));
};
