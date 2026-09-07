
import {
  requestAttendeeJoin,
  requestAttendingEvents,
  requestDeleteEvent,
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
let code : string;
let eventId: string;
const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };
const EVENT_DATE = futureDate();
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
  test("Invalid Token", async () => {
    const res = await requestAttendeeJoin("invalid", code);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Invalid Invite Code", async () => {
    const res = await requestAttendeeJoin(attendeeToken, "invalid");

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Event does not exist for invite code", async () => {
    await requestDeleteEvent(organiserToken, eventId);
    const res = await requestAttendeeJoin(attendeeToken, code);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test("Correct Return Type", async () => {
    const res = await requestAttendeeJoin(attendeeToken, code);

    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test("Attendee joined and added to Event", async () => {
    await requestAttendeeJoin(attendeeToken, code);
    const res = await requestAttendingEvents(attendeeToken);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body.events).toStrictEqual([
      {
        id: expect.any(String),
        title: 'New Event',
        description: 'New Description',
        location: 'House',
        startDate: EVENT_DATE,
        endDate: EVENT_DATE,
        startTime: 10,
        endTime: 14,
        eventType: EventType.SINGLE,
        organiser: 'Mubashir Hussain',
        organiserId: expect.any(String),
      }
    ]);
  });
});
