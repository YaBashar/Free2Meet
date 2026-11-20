import { EventType } from "../../models/eventModel";
import {
  futureDate,
  getToken,
  requestAttendeeJoin,
  requestDelete,
  requestEventInvite,
  requestNewEvent,
  requestRegenerateEventInvite,
} from "../requestHelpers";
import mongoose from "mongoose";

let token: string;
let eventId: string;
const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };
const uniqueEmail = () => `organiser.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
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
    const res = await requestEventInvite("InvalidToken", eventId);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Invalid EventID", async () => {
    const res = await requestEventInvite(token, "InvalidEventId");
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test("Success returns reusable invite with expiry", async () => {
    const res = await requestEventInvite(token, eventId);
    expect(res.body).toStrictEqual({
      inviteCode: expect.stringMatching(/^\d{6}$/),
      inviteCodeExpiry: expect.any(String),
      expired: false,
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test("Share reuses the same invite code", async () => {
    const first = await requestEventInvite(token, eventId);
    const second = await requestEventInvite(token, eventId);
    expect(first.statusCode).toStrictEqual(200);
    expect(second.statusCode).toStrictEqual(200);
    expect(second.body.inviteCode).toStrictEqual(first.body.inviteCode);
  });

  test("Same code works for multiple attendees", async () => {
    const invite = await requestEventInvite(token, eventId);
    const firstAttendee = await getToken(
      "Jamie",
      "Lee",
      `joiner1.${Date.now()}@example.com`,
      "Abcnmop.123$",
    );
    const secondAttendee = await getToken(
      "Alex",
      "Kim",
      `joiner2.${Date.now()}@example.com`,
      "Abcnmop.123$",
    );

    const firstJoin = await requestAttendeeJoin(firstAttendee, invite.body.inviteCode);
    const secondJoin = await requestAttendeeJoin(secondAttendee, invite.body.inviteCode);
    expect(firstJoin.statusCode).toStrictEqual(200);
    expect(secondJoin.statusCode).toStrictEqual(200);

    const afterJoins = await requestEventInvite(token, eventId);
    expect(afterJoins.body.inviteCode).toStrictEqual(invite.body.inviteCode);
  });

  test("Regenerate invalidates the previous code", async () => {
    const first = await requestEventInvite(token, eventId);
    const regenerated = await requestRegenerateEventInvite(token, eventId);
    expect(regenerated.statusCode).toStrictEqual(200);
    expect(regenerated.body.inviteCode).not.toStrictEqual(first.body.inviteCode);
    expect(regenerated.body.expired).toStrictEqual(false);

    const attendeeToken = await getToken(
      "Jamie",
      "Lee",
      `joiner.${Date.now()}@example.com`,
      "Abcnmop.123$",
    );
    const staleJoin = await requestAttendeeJoin(attendeeToken, first.body.inviteCode);
    expect(staleJoin.statusCode).toStrictEqual(400);

    const freshJoin = await requestAttendeeJoin(attendeeToken, regenerated.body.inviteCode);
    expect(freshJoin.statusCode).toStrictEqual(200);
  });
});
