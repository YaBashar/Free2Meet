import { EventType } from "../../models/eventModel";
import { futureDate, getToken, requestDelete, requestNewEvent, requestOrganisedEvents } from "../requestHelpers";
import mongoose from "mongoose";

let token: string;
const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };
const EVENT_DATE = futureDate();
const EVENT_DATE_2 = futureDate(2);
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
  await requestNewEvent(token, "New Event", "New Description", "House", EventType.SINGLE, EVENT_DATE, EVENT_DATE, 10, 14);
  await requestNewEvent(token, "New Event 2", "New Description 2", "House 2", EventType.SINGLE, EVENT_DATE_2, EVENT_DATE_2, 11, 14);
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}, 10000);

describe('Error', () => {
  test("Error", async () => {
    const res = await requestOrganisedEvents("invalidToken");
    expect(res.statusCode).toStrictEqual(401);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Success Case', () => {
  test("Success", async () => {
    const res = await requestOrganisedEvents(token);
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
        organiserId: expect.any(String),
        organiser: 'Mubashir Hussain',
        eventType: EventType.SINGLE,
      },
      {
        id: expect.any(String),
        title: 'New Event 2',
        description: 'New Description 2',
        location: 'House 2',
        startDate: EVENT_DATE_2,
        endDate: EVENT_DATE_2,
        startTime: 11,
        endTime: 14,
        organiserId: expect.any(String),
        organiser: 'Mubashir Hussain',
        eventType: EventType.SINGLE,
      }
    ]);
  });
});
