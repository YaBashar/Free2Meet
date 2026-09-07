/**
 * Event form validation
 *
 * Mirrors `backend/src/utils/eventHelper.ts` so create-event can catch
 * problems before the request is sent. The server remains the authority.
 *
 * Times are stored as `Date` in the form UI and sent to the API as minutes
 * since midnight (0–1439).
 */

const MIN_TEXT_LENGTH = 4;
const MAX_TEXT_LENGTH = 30;
const MINUTES_PER_DAY = 24 * 60;

export type CreateEventFormValues = {
  title: string;
  description: string;
  location: string;
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
};

export type CreateEventFieldErrors = {
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
};

function validateTextField(value: string, label: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return `${label} is required.`;
  }

  if (trimmed.length < MIN_TEXT_LENGTH) {
    return `${label} must be at least ${MIN_TEXT_LENGTH} characters.`;
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    return `${label} must be at most ${MAX_TEXT_LENGTH} characters.`;
  }

  return undefined;
}

/** Converts a local clock `Date` to minutes since midnight. */
export function dateToMinutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Formats an API `YYYY-MM-DD` date as `Wed, 26/08/2026`. */
export function formatApiDateForDisplay(apiDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(apiDate.trim());
  if (!match) {
    return apiDate;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return apiDate;
  }

  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${weekday}, ${dd}/${mm}/${year}`;
}

/** Formats minutes since midnight as a 12-hour `h:mm AM/PM` label. */
export function formatMinutesAs12Hour(totalMinutes: number): string {
  const clamped = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** Returns field messages when create-event values violate API rules. */
export function validateCreateEventForm(values: CreateEventFormValues): CreateEventFieldErrors {
  const errors: CreateEventFieldErrors = {};

  const titleError = validateTextField(values.title, "Title");
  if (titleError) {
    errors.title = titleError;
  }

  const descriptionError = validateTextField(values.description, "Description");
  if (descriptionError) {
    errors.description = descriptionError;
  }

  if (!values.location.trim()) {
    errors.location = "Location is required.";
  }

  if (!values.date || Number.isNaN(values.date.getTime())) {
    errors.date = "Choose a date.";
  }

  const startValid = values.startTime !== null && !Number.isNaN(values.startTime.getTime());
  const endValid = values.endTime !== null && !Number.isNaN(values.endTime.getTime());

  if (!startValid) {
    errors.startTime = "Choose a start time.";
  }

  if (!endValid) {
    errors.endTime = "Choose an end time.";
  }

  if (startValid && endValid && values.startTime && values.endTime) {
    const startMinutes = dateToMinutesSinceMidnight(values.startTime);
    const endMinutes = dateToMinutesSinceMidnight(values.endTime);

    if (endMinutes <= startMinutes) {
      errors.endTime = "End time must be after start time.";
    }
  }

  return errors;
}

export function hasFieldErrors(errors: CreateEventFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Parses validated time `Date`s into minutes-since-midnight for the API. */
export function parseEventTimes(startTime: Date, endTime: Date): {
  startTime: number;
  endTime: number;
} {
  return {
    startTime: dateToMinutesSinceMidnight(startTime),
    endTime: dateToMinutesSinceMidnight(endTime),
  };
}

/** Formats a local calendar date as `YYYY-MM-DD` for the events API. */
export function formatEventDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const INVITE_CODE_LENGTH = 6;

/** Returns a message when the invite code is not exactly six digits. */
export function validateInviteCode(code: string): string | undefined {
  if (!code) {
    return "Invite code is required.";
  }

  if (!new RegExp(`^\\d{${INVITE_CODE_LENGTH}}$`).test(code)) {
    return `Enter the ${INVITE_CODE_LENGTH}-digit invite code.`;
  }

  return undefined;
}
