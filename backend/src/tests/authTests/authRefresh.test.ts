import {
  requestRegister,
  requestLogin,
  requestRefresh,
  requestDelete,
  verifyEmail,
} from "../requestHelpers";
import mongoose from "mongoose";
// Allow time for MongoDB connection in beforeAll/afterAll (default 5s is too short)

const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };

beforeEach(async () => {
  await requestDelete();
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

describe("Success Cases", () => {
  test("Success", async () => {
    const res1 = await requestRegister("Mubashir", "Hussain", "Abcdefg123$", "example@gmail.com");
    await verifyEmail("example@gmail.com", res1.body.code);
    const res2 = await requestLogin("example@gmail.com", "Abcdefg123$");
    expect(res2.statusCode).toStrictEqual(200);
    expect(res2.body.refreshToken).toEqual(expect.any(String));

    const res3 = await requestRefresh(res2.body.refreshToken);
    expect(res3.body).toStrictEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(res3.statusCode).toStrictEqual(200);
  });
});

describe("Error Cases", () => {
  test("Invalid Token", async () => {
    const res = await requestRefresh("wrongRefreshToken");
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});
