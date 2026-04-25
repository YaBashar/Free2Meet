import { UserModel } from "../models/userModel";
import { AttendeeModel } from "../models/attendeeModel";
import { DeclinedModel } from "../models/declinedInviteModel";
import { EventInviteModel } from "../models/eventInviteModel";
import { EventModel } from "../models/eventModel";
import { RefreshTokenModel } from "../models/refreshTokenModel";
/*
  Clears all collections. Used exclusively in test environments to reset state between tests.
  Uses deleteMany per collection instead of dropDatabase to avoid a race condition where
  MongoDB's async drop is still in progress when the next test creates documents.
  Should never be called in production.
*/
export async function clear(): Promise<Record<string, never>> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("clear() cannot be called in production");
  }

  await Promise.all([
    UserModel.deleteMany({}),
    AttendeeModel.deleteMany({}),
    DeclinedModel.deleteMany({}),
    EventInviteModel.deleteMany({}),
    RefreshTokenModel.deleteMany({}),
    EventModel.deleteMany({}),
  ]);

  return {};
}
