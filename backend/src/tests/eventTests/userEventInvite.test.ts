import { EventType } from "../../models/eventModel";
import { futureDate, getToken, requestDelete, requestEventInvite, requestNewEvent } from "../requestHelpers";
import mongoose from "mongoose";

let token: string;
let eventId: string;
const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };
const uniqueEmail = () => `organiser.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
const inviteeEmail = "invitee@example.com";
const EVENT_DATE = futureDate();

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) throw new Error("MONGODB_TEST_URI is not set.");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI, MONGO_OPTIONS);
  }
}, 10000);

beforeEach(async () => {
  await requestDelete();
  token = await getToken("Mubashir", "Hussain", uniqueEmail(), "Abcdefg123$");
  const res1 = await requestNewEvent(token, "New Event", "New Description", "House", EventType.SINGLE, EVENT_DATE, EVENT_DATE, 10, 14);
  eventId = res1.body.eventId;
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}, 10000);

describe('Error Cases', () => {
  test("Invalid UserId Token", async () => {
    const res = await requestEventInvite("InvalidToken", eventId, inviteeEmail);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Invalid EventID", async () => {
    const res = await requestEventInvite(token, "InvalidEventId", inviteeEmail);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test("Success", async () => {
    const res = await requestEventInvite(token, eventId, inviteeEmail);
    expect(res.body).toStrictEqual({ inviteCode: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });
});
