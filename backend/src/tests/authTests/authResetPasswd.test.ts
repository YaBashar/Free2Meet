import mongoose from "mongoose";
import {
  requestDelete,
  requestRegister,
  requestForgot,
  requestVerifyResetCode,
  requestResetPassword,
} from "../requestHelpers";

const EMAIL = "example@gmail.com";
const PASSWORD = "Abcdefgh123456$";

const MONGO_OPTIONS = { serverSelectionTimeoutMS: 8000 };

let resetCode: string;

beforeEach(async () => {
  await requestDelete();

  await requestRegister("Mubashir", "Hussain", PASSWORD, EMAIL);
  const res = await requestForgot(EMAIL);
  resetCode = res.body.code;

  const res1 = await requestVerifyResetCode(resetCode);
  expect(res1.statusCode).toStrictEqual(200);
  expect(res1.body).toStrictEqual({ success: true });
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
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error(
      "MONGODB_TEST_URI is not set. Copy backend/.env.example to backend/.env and set MONGODB_URI."
    );
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI, MONGO_OPTIONS);
  }
}, 10000);

describe("POST /auth/reset-password", () => {
  it("returns 200 when password is reset successfully", async () => {
    const res = await requestResetPassword(resetCode, "NewerPassword1234*");

    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({
      success: true,
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      },
    });
  });

  it("returns 400 when using the same password", async () => {
    const res = await requestResetPassword(resetCode, PASSWORD);

    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  it("returns 400 when new password is too short", async () => {
    const res = await requestResetPassword(resetCode, "Short1!");

    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual({ error: "Password must be at least 12 characters" });
  });

  it("returns 400 when reset code is invalid", async () => {
    const res = await requestResetPassword("invalid-code", "NewerPassword1234*");

    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual({ error: "Invalid or expired reset code" });
  });

  it("returns 400 when password fails complexity validation", async () => {
    const res = await requestResetPassword(resetCode, "aaaaaaaaaaaa");

    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });
});
