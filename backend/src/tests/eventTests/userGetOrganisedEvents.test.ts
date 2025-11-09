import { requestDelete, requestAuthRegister, requestAuthLogin, requestNewEvent, requestOrganisedEvents } from '../requestHelpers';

let token: string;
beforeEach(() => {
  requestDelete();
  requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
  const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
  const data = JSON.parse(res.body.toString());
  token = data.token;
  requestNewEvent(token, 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
  requestNewEvent(token, 'New Event 2', 'New Description 2', 'House 2', '31/08/2026', 11, 14);
});

afterEach(() => {
  requestDelete();
});

describe('Error', () => {
  test('Error', () => {
    const res = requestOrganisedEvents('invalidToken');
    const data = JSON.parse(res.body.toString());

    expect(res.statusCode).toStrictEqual(401);
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Success Case', () => {
  test('Success', () => {
    const res = requestOrganisedEvents(token);
    const data = JSON.parse(res.body.toString());

    expect(res.statusCode).toStrictEqual(200);
    expect(data.events).toStrictEqual([
      {
        eventId: expect.any(String),
        title: 'New Event',
        description: 'New Description',
        location: 'House',
        date: '31/08/2025',
        startTime: 10,
        endTime: 14,
        organiser: 'Mubashir Hussain'
      },
      {
        eventId: expect.any(String),
        title: 'New Event 2',
        description: 'New Description 2',
        location: 'House 2',
        date: '31/08/2026',
        startTime: 11,
        endTime: 14,
        organiser: 'Mubashir Hussain'
      }
    ]);
  });
});
