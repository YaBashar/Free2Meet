import { requestAuthLogin, requestAuthRegister, requestDelete, requestEventInvite, requestEventInviteDetails, requestNewEvent } from '../requestHelpers';

let token: string;
let eventId: string;
let link: string;
beforeEach(() => {
  requestDelete();
  requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
  const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
  const data = JSON.parse(res.body.toString());
  token = data.token;

  const res1 = requestNewEvent(token, 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
  const data1 = JSON.parse(res1.body.toString());
  eventId = data1.eventId;

  const res2 = requestEventInvite(token, eventId);
  const data2 = JSON.parse(res2.body.toString());
  link = data2.link;
});

afterEach(() => {
  requestDelete();
});

describe('Error Cases', () => {
  test('Invalid Link', () => {
    const res = requestEventInviteDetails('InvalidEventId');
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test('Success', () => {
    const res = requestEventInviteDetails(link);
    const data = JSON.parse(res.body.toString());

    expect(data.event).toStrictEqual({
      id: expect.any(String),
      title: 'New Event',
      description: 'New Description',
      location: 'House',
      date: '31/08/2025',
      startTime: 10,
      endTime: 14,
      organiser: 'Mubashir Hussain'
    });

    expect(res.statusCode).toStrictEqual(200);
  });
});
