
import {
  requestAttendeeRespond,
  requestAttendeeSelectAvail,
  requestDelete,
  requestEventInvite,
  getToken,
  requestNewEvent,
  futureDate,
} from "../requestHelpers";
import mongoose from "mongoose";
import { EventType } from "../../models/eventModel";

let organiserToken: string;
let attendeeToken: string;
let code: string;
let eventId: string;
const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };
const EVENT_DATE = futureDate();
const PAST_DATE = "2000-01-01";
const uniqueEmail = (prefix: string) =>
  `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

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
    "New Event",
    "New Description",
    "House",
    EventType.SINGLE,
    EVENT_DATE,
    EVENT_DATE,
    10,
    14
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

describe('Error Cases', () => {
  test("Invalid User ID", async () => {
    await requestAttendeeRespond(attendeeToken, code, "accept");
    const res = await requestAttendeeSelectAvail("invalid", eventId, EVENT_DATE, 10, 12);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Invalid Event ID", async () => {
    await requestAttendeeRespond(attendeeToken, code, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, "invalid", EVENT_DATE, 10, 12);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Attendee not part of Event", async () => {
    await requestAttendeeRespond(attendeeToken, code, "reject");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, EVENT_DATE, 10, 12);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Invalid date format", async () => {
    await requestAttendeeRespond(attendeeToken, code, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, "not-a-date", 10, 12);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Date outside event range", async () => {
    await requestAttendeeRespond(attendeeToken, code, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, PAST_DATE, 10, 12);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Invalid selection - start equals end", async () => {
    await requestAttendeeRespond(attendeeToken, code, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, EVENT_DATE, 10, 10);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Time out of event range - start before event", async () => {
    await requestAttendeeRespond(attendeeToken, code, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, EVENT_DATE, 9, 12);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Time out of event range - end after event", async () => {
    await requestAttendeeRespond(attendeeToken, code, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, EVENT_DATE, 10, 15);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test("Correct return type", async () => {
    await requestAttendeeRespond(attendeeToken, code, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, EVENT_DATE, 10, 12);

    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test("Updating availability for the same date overwrites the entry", async () => {
    await requestAttendeeRespond(attendeeToken, code, "accept");
    await requestAttendeeSelectAvail(attendeeToken, eventId, EVENT_DATE, 10, 12);
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, EVENT_DATE, 11, 14);

    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });
});
