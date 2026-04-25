import request from "supertest";
import { app } from "../app";
import { clear } from "../utils/clear";
import { UserModel } from "../models/userModel";

// Clear
export const requestDelete = async () => {
  return await clear();
};

// Auth
export const requestRegister = async (
  firstName: string,
  lastName: string,
  password: string,
  email: string
) => {
  const body: Record<string, string> = { firstName, lastName, password, email };
  return await request(app).post("/auth/register").send(body);
};

export const requestLogin = async (email: string, password: string) => {
  return await request(app).post("/auth/login").send({ email, password });
};

export const requestRefresh = async (token: string) => {
  return await request(app).post("/auth/refresh").send({ refreshToken: token });
};

export const requestVerifyEmail = async (verificationCode: string) => {
  return await request(app).post("/auth/verify-email").send({ verificationCode });
};

export const requestResendVerifyEmail = async (email: string) => {
  return await request(app).post("/auth/resend-verification").send({ email });
};

export const requestForgot = async (email: string) => {
  return await request(app).post("/auth/forgot-password").send({ email });
};

export const requestResendResetCode = async (email: string) => {
  return await request(app).post("/auth/resend-reset-code").send({ email });
};

export const requestVerifyResetCode = async (resetCode: string) => {
  return await request(app).post("/auth/verify-reset-code").send({ resetCode });
};

export const requestResetPassword = async (resetCode: string, newPassword: string) => {
  return await request(app).post("/auth/reset-password").send({ resetCode, newPassword });
};

export const requestLogout = async (token: string) => {
  return await request(app).post("/auth/logout").set("Authorization", `Bearer ${token}`);
};

export async function getToken(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<string> {
  const reg = await requestRegister(firstName, lastName, password, email);

  expect(reg.status).toBe(201);
  await verifyEmail(email, reg.body.code);

  const loginResponse = await requestLogin(email, password);
  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.accessToken).toBeDefined();
  return loginResponse.body.accessToken;
}

export async function verifyEmail(email: string, verificationCode: string) {
  const response = await requestVerifyEmail(verificationCode);
  expect(response.statusCode).toBe(200);

  // Verify user is actually verified from db
  const updatedUser = await UserModel.findOne({ email: email });
  expect(updatedUser?.emailVerified).toBe(true);
  expect(updatedUser?.verificationCode).toBe(undefined);
}

// Events
export const requestNewEvent = async (
  token: string,
  title: string,
  description: string,
  location: string,
  date: string,
  startTime: number,
  endTime: number
) => {
  return await request(app)
    .post("/events/new-event")
    .set("Authorization", `Bearer ${token}`)
    .send({ title, description, location, date, startTime, endTime });
};

export const requestDeleteEvent = async (token: string, eventId: string) => {
  return await request(app).delete(`/events/${eventId}`).set("Authorization", `Bearer ${token}`);
};

export const requestEventDetails = async (token: string, eventId: string) => {
  return await request(app).get(`/events/${eventId}`).set("Authorization", `Bearer ${token}`);
};

export const requestOrganisedEvents = async (token: string) => {
  return await request(app).get("/events/organised-events").set("Authorization", `Bearer ${token}`);
};

export const requestAttendingEvents = async (token: string) => {
  return await request(app).get("/events/attending-events").set("Authorization", `Bearer ${token}`);
};

export const requestNotAttendingEvent = async (eventId: string) => {
  return await request(app).get(`/events/${eventId}/notAttending`);
};

export const requestAttendingEvent = async (eventId: string) => {
  return await request(app).get(`/events/${eventId}/attending`);
};

export const requestEventUpdate = async (
  token: string,
  eventId: string,
  updatedFields: Record<string, unknown>
) => {
  return await request(app)
    .put(`/events/${eventId}`)
    .set("Authorization", `Bearer ${token}`)
    .send(updatedFields);
};

export const requestEventInvite = async (token: string, eventId: string) => {
  return await request(app)
    .post(`/events/${eventId}/invite`)
    .set("Authorization", `Bearer ${token}`);
};

export const requestEventInviteDetails = async (inviteLink: string) => {
  return await request(app).get(`/events/invite/${inviteLink}`);
};

// Attendee

export const requestAttendeeRespond = async (token: string, inviteLink: string, action: string) => {
  return await request(app)
    .post("/attendees/respond")
    .set("Authorization", `Bearer ${token}`)
    .send({ inviteLink, action });
};

export const requestAttendeeLeave = async (token: string, eventId: string) => {
  return await request(app)
    .delete(`/attendees/leave/${eventId}`)
    .set("Authorization", `Bearer ${token}`);
};

export const requestAttendeeSelectAvail = async (
  token: string,
  eventId: string,
  startAvailable: number,
  endAvailable: number
) => {
  return await request(app)
    .put(`/attendees/availability/${eventId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ startAvailable, endAvailable });
};
