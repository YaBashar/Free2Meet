import request from 'sync-request-curl';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let organiserToken: string;
let attendeeToken: string;
let link : string;
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
  test('Invalid Token', () => {
    const res = requestAttendeeRespond('invalid', link, 'accept');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid Event Link', () => {
    const res = requestAttendeeRespond(attendeeToken, 'invalid', 'accept');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Event does not exist for invite link', () => {
    requestDeleteEvent(organiserToken, eventId);
    const res = requestAttendeeRespond(attendeeToken, link, 'accept');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test('Correct Return Type', () => {
    const res = requestAttendeeRespond(attendeeToken, link, 'accept');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Attendee accepted and added to Event', () => {
    requestAttendeeRespond(attendeeToken, link, 'accept');
    const res = requestEventDetails(organiserToken, eventId);
    const data = JSON.parse(res.body.toString());
    expect(data.event).toStrictEqual({
      id: eventId,
      title: 'New Event',
      description: 'New Description',
      location: 'House',
      date: '31/08/2025',
      startTime: 10,
      endTime: 14,
      organiser: 'Mubashir Hussain',
      attendees: ['Jonathan Lee'],
      notAttending: []
    });
  });

  test('Attendee rejected and added to Event', () => {
    requestAttendeeRespond(attendeeToken, link, 'reject');
    const res = requestEventDetails(organiserToken, eventId);
    const data = JSON.parse(res.body.toString());
    expect(data.event).toStrictEqual({
      id: eventId,
      title: 'New Event',
      description: 'New Description',
      location: 'House',
      date: '31/08/2025',
      startTime: 10,
      endTime: 14,
      organiser: 'Mubashir Hussain',
      attendees: [],
      notAttending: ['Jonathan Lee']
    });
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

const requestEventDetails = (token: string, eventId: string) => {
  return (request('GET', SERVER_URL + `/events/event-details/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};

const requestDeleteEvent = (token: string, eventId: string) => {
  return (request('DELETE', SERVER_URL + `/events/delete-event/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};
