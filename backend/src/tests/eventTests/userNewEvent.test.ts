import { requestAuthLogin, requestAuthRegister, requestDelete, requestEventDetails, requestNewEvent } from '../requestHelpers';

let token: string;
beforeEach(() => {
  requestDelete();
  requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
  const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
  const data = JSON.parse(res.body.toString());
  token = data.token;
});

afterEach(() => {
  requestDelete();
});

describe('Error Cases', () => {
  test('Invalid User Token', () => {
    const res = requestNewEvent('Invalid Token', 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Event already Exists', () => {
    requestNewEvent(token, 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
    const res = requestNewEvent(token, 'Same Event', 'Same Description', 'House', '31/08/2025', 10, 14);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test.each([
    [9, 14],
    [11, 15],
    [9, 15],
    [11, 13]
  ])('Clashing Times', (start, end) => {
    requestNewEvent(token, 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
    const res = requestNewEvent(token, 'Same Event', 'Same Description', 'House', '31/08/2025', start, end);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test.each([
    'h', 'ha', 'hab', 'A'.repeat(31)
  ])('Invalid Title Length', (title) => {
    const res = requestNewEvent(token, title, 'New Description', 'House', '31/08/2025', 10, 14);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test.each([
    'h', 'ha', 'hab', 'A'.repeat(31)
  ])('Invalid Description Length', (description) => {
    const res = requestNewEvent(token, 'New Event', description, 'House', '31/08/2025', 10, 14);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid Time', () => {
    const res = requestNewEvent(token, 'New Event', 'New Description', 'House', '31/08/2025', 10, 8);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success Cases', () => {
  test('Success', () => {
    const res = requestNewEvent(token, 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
    const data = JSON.parse(res.body.toString());
    expect(data.eventId).toStrictEqual(expect.any(String));
    expect(res.statusCode).toStrictEqual(200);
  });

  test('New Event Exists', () => {
    const res1 = requestNewEvent(token, 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
    const data1 = JSON.parse(res1.body.toString());
    const eventId = data1.eventId;

    const res2 = requestEventDetails(token, eventId);
    const data2 = JSON.parse(res2.body.toString());
    expect(data2.event).toStrictEqual({
      id: eventId,
      title: 'New Event',
      description: 'New Description',
      location: 'House',
      date: '31/08/2025',
      startTime: 10,
      endTime: 14,
      organiser: 'Mubashir Hussain'
    });

    expect(res2.statusCode).toStrictEqual(200);
  });
});
