import { EventType } from "../../models/eventModel";
import { futureDate, getToken, requestDelete, requestEventInvite, requestEventInviteDetails, requestNewEvent } from "../requestHelpers";
import mongoose from "mongoose";

let token: string;
let eventId: string;
let code: string;
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
  const res2 = await requestEventInvite(token, eventId, inviteeEmail);
  code = res2.body.inviteCode;
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}, 10000);

describe('Error Cases', () => {
  test("Invalid Link", async () => {
    const res = await requestEventInviteDetails("InvalidEventId");
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test("Success", async () => {
    const res = await requestEventInviteDetails(code);
    expect(res.body.event).toStrictEqual({
      id: expect.any(String),
      title: 'New Event',
      description: 'New Description',
      location: 'House',
      startDate: EVENT_DATE,
      endDate: EVENT_DATE,
      startTime: 10,
      endTime: 14,
      organiserId: expect.any(String),
      organiser: 'Mubashir Hussain',
      eventType: EventType.SINGLE,
    });

    expect(res.statusCode).toStrictEqual(200);
  });
});
