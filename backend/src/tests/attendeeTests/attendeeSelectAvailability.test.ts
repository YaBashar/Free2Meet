
import {
  requestAttendeeRespond,
  requestAttendeeSelectAvail,
  requestDelete,
  requestEventInvite,
  getToken,
  requestNewEvent,
} from "../requestHelpers";
import mongoose from "mongoose";

let organiserToken: string;
let attendeeToken: string;
let link: string;
let eventId: string;
const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };
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
    "31/08/2025",
    10,
    14
  );
  eventId = newEventRes.body.eventId;

  const inviteRes = await requestEventInvite(organiserToken, eventId);
  link = inviteRes.body.link;

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
    await requestAttendeeRespond(attendeeToken, link, "accept");
    const res = await requestAttendeeSelectAvail("invalid", eventId, 10, 12);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Invalid Event ID", async () => {
    await requestAttendeeRespond(attendeeToken, link, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, "invalid", 10, 12);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Invalid Availability", async () => {
    await requestAttendeeRespond(attendeeToken, link, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, 10, 10);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Attendee not part of Event", async () => {
    await requestAttendeeRespond(attendeeToken, link, "reject");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, 10, 12);

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test("Success", async () => {
    await requestAttendeeRespond(attendeeToken, link, "accept");
    const res = await requestAttendeeSelectAvail(attendeeToken, eventId, 10, 12);

    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });
});
