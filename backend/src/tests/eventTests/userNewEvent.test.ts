import { getToken, requestDelete, requestEventDetails, requestNewEvent } from "../requestHelpers";
import mongoose from "mongoose";

let token: string;
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
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}, 10000);

describe('Error Cases', () => {
  test("Invalid User Token", async () => {
    const res = await requestNewEvent("Invalid Token", "New Event", "New Description", "House", "31/08/2025", 10, 14);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Event already Exists", async () => {
    await requestNewEvent(token, "New Event", "New Description", "House", "31/08/2025", 10, 14);
    const res = await requestNewEvent(token, "Same Event", "Same Description", "House", "31/08/2025", 10, 14);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test.each([
    [9, 14],
    [11, 15],
    [9, 15],
    [11, 13]
  ])("Clashing Times", async (start, end) => {
    await requestNewEvent(token, "New Event", "New Description", "House", "31/08/2025", 10, 14);
    const res = await requestNewEvent(token, "Same Event", "Same Description", "House", "31/08/2025", start, end);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test.each([
    'h', 'ha', 'hab', 'A'.repeat(31)
  ])("Invalid Title Length", async (title) => {
    const res = await requestNewEvent(token, title, "New Description", "House", "31/08/2025", 10, 14);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test.each([
    'h', 'ha', 'hab', 'A'.repeat(31)
  ])("Invalid Description Length", async (description) => {
    const res = await requestNewEvent(token, "New Event", description, "House", "31/08/2025", 10, 14);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Invalid Time", async () => {
    const res = await requestNewEvent(token, "New Event", "New Description", "House", "31/08/2025", 10, 8);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success Cases', () => {
  test("Success", async () => {
    const res = await requestNewEvent(token, "New Event", "New Description", "House", "31/08/2025", 10, 14);
    expect(res.body.eventId).toStrictEqual(expect.any(String));
    expect(res.statusCode).toStrictEqual(200);
  });

  test("New Event Exists", async () => {
    const res1 = await requestNewEvent(token, "New Event", "New Description", "House", "31/08/2025", 10, 14);
    const eventId = res1.body.eventId;

    const res2 = await requestEventDetails(token, eventId);
    expect(res2.body.event).toStrictEqual({
      id: eventId,
      title: 'New Event',
      description: 'New Description',
      location: 'House',
      date: '31/08/2025',
      startTime: 10,
      endTime: 14,
      organiser: 'Mubashir Hussain'
    });

    expect(res2.statusCode).toStrictEqual(200);
  });
});
