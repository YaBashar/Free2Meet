/**
 * Events API
 *
 * Owns payloads and responses for creating events and listing the signed-in
 * member's organised (hosting) and attending events. Screens pass the session
 * access token; this module does not read auth context.
 */

import { apiRequest } from "@/lib/api/client";

export const EventType = {
  SINGLE: "SINGLE_DAY",
  MULTIPLE: "MULTI_DAY",
  HYBRID: "HYBRID",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

/** Event summary returned by list and detail endpoints. */
export type EventSummary = {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  /** Minutes since midnight (0–1439). */
  startTime: number;
  /** Minutes since midnight (0–1439). */
  endTime: number;
  organiserId: string;
  organiser: string;
  eventType: EventType;
};

export type CreateEventPayload = {
  title: string;
  description: string;
  location: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  /** Minutes since midnight (0–1439). */
  startTime: number;
  /** Minutes since midnight (0–1439). */
  endTime: number;
};

export type CreateEventResponse = {
  eventId: string;
};

export type OrganisedEventsResponse = {
  events: EventSummary[];
};

export type AttendingEventsResponse = {
  events: EventSummary[];
};

/** Creates a new event owned by the signed-in member. */
export async function createEvent(
  accessToken: string,
  payload: CreateEventPayload,
): Promise<CreateEventResponse> {
  return apiRequest<CreateEventResponse>("/events/new-event", {
    method: "POST",
    body: payload,
    accessToken,
  });
}

/** Lists events the signed-in member organises (Hosting tab). */
export async function getOrganisedEvents(accessToken: string): Promise<OrganisedEventsResponse> {
  return apiRequest<OrganisedEventsResponse>("/events/organised-events", {
    accessToken,
  });
}

/** Lists events the signed-in member is attending. */
export async function getAttendingEvents(accessToken: string): Promise<AttendingEventsResponse> {
  return apiRequest<AttendingEventsResponse>("/events/attending-events", {
    accessToken,
  });
}

export type CreateEventInvitePayload = {
  /** Optional — when omitted, only the shareable invite code is created. */
  inviteeEmail?: string;
};

export type CreateEventInviteResponse = {
  inviteCode: string;
};

/**
 * Creates a pending invite for an organised event and returns the 6-digit code.
 * Callers can copy or share the code; email delivery is optional.
 */
export async function createEventInvite(
  accessToken: string,
  eventId: string,
  payload: CreateEventInvitePayload = {},
): Promise<CreateEventInviteResponse> {
  return apiRequest<CreateEventInviteResponse>(`/events/${eventId}/invite`, {
    method: "POST",
    body: payload,
    accessToken,
  });
}
