import { requestAttendeeRespond, requestAttendingEvents, requestAuthLogin, requestAuthRegister, requestDelete, requestEventInvite, requestNewEvent } from '../requestHelpers';

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
});

afterEach(() => {
  requestDelete();
});

describe('Error', () => {
  test('Error', () => {
    const res = requestAttendingEvents('invalidToken');
    const data = JSON.parse(res.body.toString());

    expect(res.statusCode).toStrictEqual(401);
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Success', () => {
  test('Success', () => {
    const res = requestAttendingEvents(attendeeToken);
    const data = JSON.parse(res.body.toString());

    expect(res.statusCode).toStrictEqual(200);
    expect(data.events).toStrictEqual([{
      title: 'New Event',
      description: 'New Description',
      location: 'House',
      date: '31/08/2025',
      startTime: 10,
      endTime: 14,
      organiser: 'Mubashir Hussain'
    }]);
  });
});
