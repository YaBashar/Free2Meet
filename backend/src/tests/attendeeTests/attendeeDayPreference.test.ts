import request from "supertest";
import { app } from "../../app";
import {
  getToken,
  requestAttendeeDayPreference,
  requestAttendeeJoin,
  requestDelete,
  requestEventInvite,
  requestNewEvent,
  futureDate,
} from "../requestHelpers";
import mongoose from "mongoose";
import { EventType } from "../../models/eventModel";

const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };

function datePlusDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const uniqueEmail = (prefix: string) =>
  `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

let organiserToken: string;
let attendeeToken: string;
let code: string;
let eventId: string;
const RANGE_START = futureDate();
const RANGE_END = datePlusDays(RANGE_START, 5);
const DAY_IN_RANGE = datePlusDays(RANGE_START, 2);
const DAY_OUT_OF_RANGE = datePlusDays(RANGE_END, 1);
const PAST_DATE = "2000-01-01";

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error(
      "MONGODB_TEST_URI is not set. Copy backend/.env.example to backend/.env and set MONGODB_URI."
    );
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI, MONGO_OPTIONS);
  }
}, 10000);

beforeEach(async () => {
  await requestDelete();
  const organiserEmail = uniqueEmail("organiser");
  const attendeeEmail = uniqueEmail("attendee");

  organiserToken = await getToken("Mubashir", "Hussain", organiserEmail, "Abcdefg123$");

  const newEventRes = await requestNewEvent(
    organiserToken,
    "Hybrid Event",
    "New Description",
    "House",
    EventType.HYBRID,
    RANGE_START,
    RANGE_END,
    10,
    18
  );
  eventId = newEventRes.body.eventId;

  const inviteRes = await requestEventInvite(organiserToken, eventId, attendeeEmail);
  code = inviteRes.body.inviteCode;

  attendeeToken = await getToken("Jonathan", "Lee", attendeeEmail, "Abcnmop.123$");
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}, 10000);

describe("Error cases", () => {
  test("Invalid token", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await requestAttendeeDayPreference("invalid", eventId, [DAY_IN_RANGE]);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Invalid event id", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await requestAttendeeDayPreference(attendeeToken, "invalid", [DAY_IN_RANGE]);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("preferredDates must be an array", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await request(app)
      .put(`/attendees/day-preference/${eventId}`)
      .set("Authorization", `Bearer ${attendeeToken}`)
      .send({ preferredDates: "not-an-array" });

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("preferredDates entries must be strings", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await request(app)
      .put(`/attendees/day-preference/${eventId}`)
      .set("Authorization", `Bearer ${attendeeToken}`)
      .send({ preferredDates: [DAY_IN_RANGE, 123] });

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Attendee not part of event", async () => {
    const res = await requestAttendeeDayPreference(attendeeToken, eventId, [DAY_IN_RANGE]);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Invalid date format", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await requestAttendeeDayPreference(attendeeToken, eventId, ["not-a-date"]);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Date outside event range", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await requestAttendeeDayPreference(attendeeToken, eventId, [PAST_DATE]);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Date after range end", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await requestAttendeeDayPreference(attendeeToken, eventId, [DAY_OUT_OF_RANGE]);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe("Success", () => {
  test("Stores preferred days", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await requestAttendeeDayPreference(attendeeToken, eventId, [
      RANGE_START,
      DAY_IN_RANGE,
    ]);

    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test("Dedupes duplicate dates", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await requestAttendeeDayPreference(attendeeToken, eventId, [
      DAY_IN_RANGE,
      DAY_IN_RANGE,
    ]);

    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });
});

describe("Single-day event (non-hybrid)", () => {
  let singleEventId: string;
  let singleCode: string;
  let singleAttendeeToken: string;
  let singleDay: string;

  beforeEach(async () => {
    await requestDelete();
    singleDay = futureDate();

    const organiserEmail = uniqueEmail("org2");
    const attendeeEmail = uniqueEmail("att2");

    const organiserTok = await getToken("Org", "User", organiserEmail, "Abcdefg123$");
    const created = await requestNewEvent(
      organiserTok,
      "Single Event",
      "New Description",
      "Venue",
      EventType.SINGLE,
      singleDay,
      singleDay,
      9,
      17
    );
    singleEventId = created.body.eventId;
    const inv = await requestEventInvite(organiserTok, singleEventId, attendeeEmail);
    singleCode = inv.body.inviteCode;
    singleAttendeeToken = await getToken("Att", "endee", attendeeEmail, "Abcnmop.123$");
  });

  test("Day preference rejected for non-hybrid event", async () => {
    await requestAttendeeJoin(singleAttendeeToken, singleCode);
    const res = await requestAttendeeDayPreference(singleAttendeeToken, singleEventId, [singleDay]);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});