
import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { UpdateEvents } from '../models/interfaces';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Clear
export const requestDelete = () => {
  return (request('DELETE', SERVER_URL + '/clear',
    { timeout: TIMEOUT_MS }));
};
// Auth
export const requestAuthRegister = (firstName: string, lastName: string, password: string, email: string) => {
  return (request('POST', SERVER_URL + '/auth/register', {
    json: { firstName, lastName, password, email }, timeout: TIMEOUT_MS
  }));
};

export const requestAuthLogin = (email: string, password: string) => {
  return (request('POST', SERVER_URL + '/auth/login', {
    json: { email, password }, timeout: TIMEOUT_MS
  }));
};

export const requestAuthUserDetails = (token: string) => {
  return (request('GET', SERVER_URL + '/auth/user-details',
    { headers: { Authorization: `Bearer ${token}` } }
  ));
};

export const requestAuthLogout = (accessToken: string, cookie: string[]) => {
  return (request('POST', SERVER_URL + '/auth/logout', {
    headers: {
      Cookie: cookie,
      Authorization: `Bearer ${accessToken}`
    }
  }));
};

export const requestRefreshToken = (cookie: string[]) => {
  return (request('POST', SERVER_URL + '/auth/refresh', {
    headers: {
      Cookie: cookie
    }
  }));
};

export const requestResetPasswd = (email:string) => {
  return (request('POST', SERVER_URL + '/auth/request-reset', {
    json: { email }, timeout: TIMEOUT_MS
  }));
};

export const requestSetNewPasswd = (userId: string, token: string, newPassword: string, confirmNewPasswd: string) => {
  return (request('POST', SERVER_URL + '/auth/reset-password', {
    json: { userId, token, newPassword, confirmNewPasswd }
  }));
};

export const requestUserChangePassword = (token: string, currentPassword:string, newPassword: string, confirmNewPasswd: string) => {
  return (request('PUT', SERVER_URL + '/auth/change-password', {
    headers: { Authorization: `Bearer ${token}` },
    json: { currentPassword, newPassword, confirmNewPasswd },
    timeout: TIMEOUT_MS
  }));
};

// Event
export const requestNewEvent = (token: string, title: string, description: string, location: string, date: string, startTime: number, endTime: number) => {
  return (request('POST', SERVER_URL + '/events/new-event', {
    headers: { Authorization: `Bearer ${token}` },
    json: { title, description, location, date, startTime, endTime },
    timeout: TIMEOUT_MS
  }));
};

export const requestDeleteEvent = (token: string, eventId: string) => {
  return (request('DELETE', SERVER_URL + `/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};

export const requestEventDetails = (token: string, eventId: string) => {
  return (request('GET', SERVER_URL + `/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};

export const requestOrganisedEvents = (token: string) => {
  return (request('GET', SERVER_URL + '/events/organised-events', {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};

export const requestAttendingEvents = (token: string) => {
  console.log(token);
  return (request('GET', SERVER_URL + '/events/attending-events', {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};

export const requestEventUpdate = (token: string, eventId: string, updatedFields: UpdateEvents) => {
  return (request('PUT', SERVER_URL + `/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    json: updatedFields,
    timeout: TIMEOUT_MS
  }));
};

export const requestEventInvite = (token: string, eventId: string) => {
  return (request('POST', SERVER_URL + `/events/${eventId}/invite`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};

// Attendee

export const requestAttendeeRespond = (token: string, inviteLink: string, action: string) => {
  return (request('POST', SERVER_URL + '/attendees/respond', {
    headers: { Authorization: `Bearer ${token}` },
    json: { inviteLink, action }
  }));
};

export const requestAttendeeLeave = (token: string, eventId: string) => {
  return (request('DELETE', SERVER_URL + `/attendees/leave/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: TIMEOUT_MS
  }));
};

export const requestAttendeeSelectAvail = (token: string, eventId: string, startAvailable: number, endAvailable: number) => {
  return (request('PUT', SERVER_URL + `/attendees/availability/${eventId}`, {
    headers: { authorization: `Bearer ${token}` },
    json: { startAvailable, endAvailable }
  }));
};
