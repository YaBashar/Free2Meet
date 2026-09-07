import {
  getToken,
  requestDelete,
  requestEventInvite,
  requestNewEvent,
  futureDate,
  requestNotAttendingEvent
} from "../requestHelpers";
import mongoose from "mongoose";
import { EventType } from "../../models/eventModel";
import { EventParticipantModel } from "../../models/eventParticipantModel";

let organiserToken: string;
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
  const attendeeEmail = uniqueEmail("attendee");
  await requestEventInvite(organiserToken, eventId, attendeeEmail);

  // Declined attendees are not created via invite codes (joining is acceptance).
  await EventParticipantModel.create({
    eventId,
    name: "Jonathan Lee",
    role: "Attendee",
    status: "Declined",
  });
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}, 10000);

describe(('Error'), () => {
  test("Invalid Event Id", async () => {
    const res = await requestNotAttendingEvent("invalid");
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe(('Success'), () => {
  test("Success", async () => {
    const res = await requestNotAttendingEvent(eventId);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual([
      {
        name: 'Jonathan Lee',
      }
    ]);
  });
});
