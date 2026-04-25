import {
  requestDelete,
  requestRegister,
  requestResendVerifyEmail,
  requestVerifyEmail,
} from "../requestHelpers";
import mongoose from "mongoose";

const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };

beforeEach(async () => {
  await requestDelete();
});

afterEach(async () => {
  await requestDelete();
});

afterAll(async () => {
  await mongoose.connection.close();
}, 15000);

beforeAll(async () => {
  // Ensure DB is connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI!, MONGO_OPTIONS);
  }
}, 15000);

describe("Success", () => {
  test("Sent Successfully", async () => {
    await requestRegister("Mubashir", "Hussain", "Abcdefgh123456$", "example@gmail.com");

    const res = await requestResendVerifyEmail("example@gmail.com");

    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({ success: true, code: expect.any(String) });
  });
});

describe("Error", () => {
  test("Invalid Email with no code sent", async () => {
    await requestRegister("Mubashir", "Hussain", "Abcdefgh123456$", "example@gmail.com");
    const res = await requestResendVerifyEmail("invalid@gmail.com");
    const data = res.body;

    expect(res.statusCode).toStrictEqual(200);
    expect(data.code).toBeUndefined();
  });

  test("returns 400 when email is already verified", async () => {
    const registerRes = await requestRegister(
      "Mubashir",
      "Hussain",
      "Abcdefgh123456$",
      "verified@example.com"
    );

    await requestVerifyEmail(registerRes.body.code);

    const res = await requestResendVerifyEmail("verified@example.com");

    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual({ error: "Email is already verified" });
  });
});
