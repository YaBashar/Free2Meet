import {
  getToken,
  requestAttendeeJoin,
  requestAttendingEvent,
  requestDelete,
  requestDeleteEvent,
  requestEventDetails,
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

  const firstAttendeeEmail = uniqueEmail("attendee");
  const secondAttendeeEmail = uniqueEmail("attendee2");

  const res2 = await requestEventInvite(organiserToken, eventId, firstAttendeeEmail);
  code = res2.body.inviteCode;
  const res3 = await requestEventInvite(organiserToken, eventId, secondAttendeeEmail);
  const secondCode = res3.body.inviteCode;

  attendeeToken = await getToken("Jonathan", "Lee", firstAttendeeEmail, "Abcnmop.123$");
  await requestAttendeeJoin(attendeeToken, code);
  const secondAttendeeToken = await getToken("Adrian", "Newey", secondAttendeeEmail, "Defgnmop.123$");
  await requestAttendeeJoin(secondAttendeeToken, secondCode);
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
