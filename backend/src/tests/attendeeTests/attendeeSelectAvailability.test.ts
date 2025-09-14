import { requestAttendeeRespond, requestAttendeeSelectAvail, requestAuthLogin, requestAuthRegister, requestDelete, requestEventInvite, requestNewEvent } from '../requestHelpers';

let organiserToken: string;
let attendeeToken: string;
let link: string;
let eventId: string;

beforeEach(() => {
  requestDelete();

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
  requestDelete();
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
