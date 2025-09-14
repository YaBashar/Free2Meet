import { requestAuthLogin, requestAuthRegister, requestDelete, requestEventInvite, requestNewEvent } from '../requestHelpers';

let token: string;
let eventId: string;
beforeEach(() => {
  requestDelete();
  requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
  const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
  const data = JSON.parse(res.body.toString());
  token = data.token;

  const res1 = requestNewEvent(token, 'New Event', 'New Description', 'House', '31/08/2025', 10, 14);
  const data1 = JSON.parse(res1.body.toString());
  eventId = data1.eventId;
});

afterEach(() => {
  requestDelete();
});

describe('Error Cases', () => {
  test('Invalid UserId Token', () => {
    const res = requestEventInvite('InvalidToken', eventId);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid EventID', () => {
    const res = requestEventInvite(token, 'InvalidEventId');
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test('Success', () => {
    const res = requestEventInvite(token, eventId);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ link: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });
});
