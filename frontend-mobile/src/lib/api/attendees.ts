/**
 * Attendees API
 *
 * Owns payloads and responses for joining events via invite code and other
 * attendee actions. Screens pass the session access token; this module does
 * not read auth context.
 */

import { apiRequest } from "@/lib/api/client";

export type JoinEventPayload = {
  inviteCode: string;
};

/** Joins an event using the 6-digit invite code (joining is acceptance). */
export async function joinEvent(
  accessToken: string,
  payload: JoinEventPayload,
): Promise<object> {
  return apiRequest<object>("/attendees/join", {
    method: "POST",
    body: payload,
    accessToken,
  });
}
