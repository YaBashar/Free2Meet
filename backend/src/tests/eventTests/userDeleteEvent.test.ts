import { requestDelete, requestAuthRegister, requestAuthLogin, requestNewEvent, requestDeleteEvent, requestEventDetails, requestEventInvite, requestAttendeeRespond, requestAttendingEvent } from '../requestHelpers';

let organiserToken: string;
let attendeeToken: string;
let link : string;
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

  requestAttendeeRespond(attendeeToken, link, 'accept');

  requestAuthRegister('Adrian', 'Newey', 'defgnmop.123$', 'adr@gmail.com');
  const res4 = requestAuthLogin('adr@gmail.com', 'defgnmop.123$');
  const data4 = JSON.parse(res4.body.toString());
  attendeeToken = data4.token;

  requestAttendeeRespond(attendeeToken, link, 'accept');
});

afterEach(() => {
  requestDelete();
});

describe('Error Cases', () => {
  test('Invalid UserId Token', () => {
    const res = requestDeleteEvent('InvalidToken', eventId);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid EventID', () => {
    const res = requestDeleteEvent(organiserToken, 'InvalidEventId');
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success Cases', () => {
  test('Successful Return Type', () => {
    const res = requestDeleteEvent(organiserToken, eventId);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Confirming Event does not exist', () => {
    requestDeleteEvent(organiserToken, eventId);
    const res = requestEventDetails(organiserToken, eventId);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Confirm all attendees removed', () => {
    requestDeleteEvent(organiserToken, eventId);
    const res = requestAttendingEvent(eventId);
    const data = JSON.parse(res.body.toString());
    expect(res.statusCode).toStrictEqual(200);
    expect(data).toStrictEqual([]);
  });
});
