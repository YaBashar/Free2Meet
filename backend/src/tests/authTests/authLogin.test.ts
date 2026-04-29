import { requestLogin, requestRegister, requestDelete, verifyEmail } from "../requestHelpers";

import mongoose from "mongoose";

// Allow time for MongoDB connection in beforeAll/afterAll (default 5s is too short)

const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };

beforeEach(async () => {
  await requestDelete();
  const res = await requestRegister("Mubashir", "Hussain", "Abcdefg123$", "example@gmail.com");
  await verifyEmail("example@gmail.com", res.body.code);
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}, 10000);

beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_TEST_URI is not set. Copy backend/.env.example to backend/.env and set MONGODB_URI."
    );
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
  }
}, 10000);

describe("Error Cases", () => {
  test("Email address does not exist", async () => {
    const res = await requestLogin("zid2@unsw.edu.au", "Abcdefg123$");

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test("Incorrect password", async () => {
    const res = await requestLogin("example@gmail.com", "abcd123");

    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe("Success Cases", () => {
  test("Logged In Successfully", async () => {
    const res = await requestLogin("example@gmail.com", "Abcdefg123$");
    expect(res.body).toStrictEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        id: expect.any(String),
        name: "Mubashir Hussain",
        email: "example@gmail.com",
      },
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});
