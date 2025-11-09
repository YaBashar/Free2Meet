import { UpdateEvents } from '../../models/interfaces';
import { requestAuthLogin, requestAuthRegister, requestDelete, requestEventDetails, requestEventUpdate, requestNewEvent } from '../requestHelpers';

let token: string;
let eventId: string;
let updatedFields: UpdateEvents;
beforeEach(() => {
  requestDelete();
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
  requestDelete();
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
      organiser: 'Mubashir Hussain'
    });

    expect(res.statusCode).toStrictEqual(200);
  });
});
