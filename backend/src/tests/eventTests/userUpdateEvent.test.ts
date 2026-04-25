import { getToken, requestDelete, requestEventDetails, requestEventUpdate, requestNewEvent } from "../requestHelpers";
import mongoose from "mongoose";

let token: string;
let eventId: string;
let updatedFields: Record<string, unknown>;
const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };
const uniqueEmail = () => `organiser.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) throw new Error("MONGODB_TEST_URI is not set.");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI, MONGO_OPTIONS);
  }
}, 10000);

beforeEach(async () => {
  await requestDelete();
  token = await getToken("Mubashir", "Hussain", uniqueEmail(), "Abcdefg123$");
  const res1 = await requestNewEvent(token, "New Event", "New Description", "House", "31/08/2025", 10, 14);
  eventId = res1.body.eventId;

  updatedFields = {
    title: 'Different Event',
    description: 'Different Description',
    location: 'Different House',
    date: '31/08/2025',
    startTime: 10,
    endTime: 14
  };
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}, 10000);

describe('Error Cases', () => {
  test("Invalid UserId Token", async () => {
    const res = await requestEventUpdate("InvalidToken", eventId, updatedFields);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Invalid EventID", async () => {
    const res = await requestEventUpdate(token, "InvalidEventId", updatedFields);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success', () => {
  test("Successful Return type", async () => {
    const res = await requestEventUpdate(token, eventId, updatedFields);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test("Successfully Updated", async () => {
    await requestEventUpdate(token, eventId, updatedFields);
    const res = await requestEventDetails(token, eventId);
    expect(res.body.event).toStrictEqual({
      id: eventId,
      title: 'Different Event',
      description: 'Different Description',
      location: 'Different House',
      date: '31/08/2025',
      startTime: 10,
      endTime: 14,
      organiser: 'Mubashir Hussain'
    });

    expect(res.statusCode).toStrictEqual(200);
  });
});
