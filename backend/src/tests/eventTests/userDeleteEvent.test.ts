import {
  getToken,
  requestAttendeeRespond,
  requestAttendingEvent,
  requestDelete,
  requestDeleteEvent,
  requestEventDetails,
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
  const secondAttendeeToken = await getToken("Adrian", "Newey", uniqueEmail("attendee2"), "Defgnmop.123$");
  await requestAttendeeRespond(secondAttendeeToken, link, "accept");
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}, 10000);

describe('Error Cases', () => {
  test("Invalid UserId Token", async () => {
    const res = await requestDeleteEvent("InvalidToken", eventId);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Invalid EventID", async () => {
    const res = await requestDeleteEvent(organiserToken, "InvalidEventId");
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success Cases', () => {
  test("Successful Return Type", async () => {
    const res = await requestDeleteEvent(organiserToken, eventId);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test("Confirming Event does not exist", async () => {
    await requestDeleteEvent(organiserToken, eventId);
    const res = await requestEventDetails(organiserToken, eventId);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Confirm all attendees removed", async () => {
    await requestDeleteEvent(organiserToken, eventId);
    const res = await requestAttendingEvent(eventId);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual([]);
  });
});
