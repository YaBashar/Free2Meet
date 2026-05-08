import {
  getToken,
  requestAttendeeRespond,
  requestDelete,
  requestEventInvite,
  requestNewEvent,
  futureDate,
  requestNotAttendingEvent
} from "../requestHelpers";
import mongoose from "mongoose";

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
  const res1 = await requestNewEvent(organiserToken, "New Event", "New Description", "House", "single", EVENT_DATE, EVENT_DATE, 10, 14);
  eventId = res1.body.eventId;
  const attendeeEmail = uniqueEmail("attendee");
  const res2 = await requestEventInvite(organiserToken, eventId, attendeeEmail);
  code = res2.body.inviteCode;
  attendeeToken = await getToken("Jonathan", "Lee", attendeeEmail, "Abcnmop.123$");
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}, 10000);

describe(('Error'), () => {
  test("Invalid Event Id", async () => {
    await requestAttendeeRespond(attendeeToken, code, "reject");
    const res = await requestNotAttendingEvent("invalid");
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe(('Success'), () => {
  test("Success", async () => {
    await requestAttendeeRespond(attendeeToken, code, "reject");
    const res = await requestNotAttendingEvent(eventId);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual([
      {
        name: 'Jonathan Lee',
      }
    ]);
  });
});
