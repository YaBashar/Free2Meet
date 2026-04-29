import {
  getToken,
  requestAttendeeRespond,
  requestAttendingEvents,
  requestDelete,
  requestEventInvite,
  requestNewEvent
} from "../requestHelpers";
import mongoose from "mongoose";

let organiserToken: string;
let attendeeToken: string;
let link : string;
let eventId: string;
const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) throw new Error("MONGODB_TEST_URI is not set.");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI, MONGO_OPTIONS);
  }
}, 10000);

const uniqueEmail = (prefix: string) => `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

beforeEach(async () => {
  await requestDelete();
  organiserToken = await getToken("Mubashir", "Hussain", uniqueEmail("organiser"), "Abcdefg123$");
  const res1 = await requestNewEvent(organiserToken, "New Event", "New Description", "House", "31/08/2025", 10, 14);
  eventId = res1.body.eventId;
  const res2 = await requestEventInvite(organiserToken, eventId);
  link = res2.body.link;
  attendeeToken = await getToken("Jonathan", "Lee", uniqueEmail("attendee"), "Abcnmop.123$");
  await requestAttendeeRespond(attendeeToken, link, "accept");
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
      eventId: expect.any(String),
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
