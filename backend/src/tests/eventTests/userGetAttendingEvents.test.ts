import {
  getToken,
  requestAttendeeRespond,
  requestAttendingEvents,
  requestDelete,
  requestEventInvite,
  futureDate,
  requestNewEvent
} from "../requestHelpers";
import mongoose from "mongoose";
import { EventType } from "../../models/eventModel";

let organiserToken: string;
let attendeeToken: string;
let code : string;
let eventId: string;
const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) throw new Error("MONGODB_TEST_URI is not set.");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI, MONGO_OPTIONS);
  }
}, 10000);

const EVENT_DATE = futureDate();
const uniqueEmail = (prefix: string) => `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

beforeEach(async () => {
  await requestDelete();
  organiserToken = await getToken("Mubashir", "Hussain", uniqueEmail("organiser"), "Abcdefg123$");
  const res1 = await requestNewEvent(organiserToken, "New Event", "New Description", "House", EventType.SINGLE, EVENT_DATE, EVENT_DATE, 10, 14);
  eventId = res1.body.eventId;
  const attendeeEmail = uniqueEmail("attendee");
  const res2 = await requestEventInvite(organiserToken, eventId, attendeeEmail);
  code = res2.body.inviteCode;
  attendeeToken = await getToken("Jonathan", "Lee", attendeeEmail, "Abcnmop.123$");
  await requestAttendeeRespond(attendeeToken, code, "accept");
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}, 10000);

describe('Error', () => {
  test("Error", async () => {
    const res = await requestAttendingEvents("invalidToken");
    expect(res.statusCode).toStrictEqual(401);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Success', () => {
  test("Success", async () => {
    const res = await requestAttendingEvents(attendeeToken);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body.events).toStrictEqual([{
      id: expect.any(String),
      title: 'New Event',
      description: 'New Description',
      location: 'House',
      startDate: EVENT_DATE,
      endDate: EVENT_DATE,
      startTime: 10,
      endTime: 14,
      organiserId: expect.any(String),
      organiser: 'Mubashir Hussain',
        eventType: EventType.SINGLE,
    }]);
  });
});
