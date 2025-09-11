
import request from 'sync-request-curl';
import { port, url } from '../config.json';

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
