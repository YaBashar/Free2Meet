import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
});

describe('Error Cases', () => {
  test('Refresh token doesn’t belong to user', () => {
    requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
    const res1 = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
    const data1 = JSON.parse(res1.body.toString());
    const accessToken = data1.token;

    const invalidCookie = 'jwt=wrongRefreshToken';
    const res = requestAuthLogout(accessToken, [invalidCookie]);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success Cases', () => {
  test('Success', () => {
    requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
    const res1 = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
    const data1 = JSON.parse(res1.body.toString());
    const accessToken = data1.token;

    const cookie = res1.headers['set-cookie'];

    const res2 = requestAuthLogout(accessToken, cookie);
    const data = JSON.parse(res2.body.toString());
    expect(data).toStrictEqual({});
    expect(res2.statusCode).toStrictEqual(200);
  });
});

const requestAuthRegister = (firstName: string, lastName: string, password: string, email: string) => {
  return (request('POST', SERVER_URL + '/auth/register', {
    json: { firstName, lastName, password, email }, timeout: TIMEOUT_MS
  }));
};

const requestAuthLogin = (email: string, password: string) => {
  return (request('POST', SERVER_URL + '/auth/login', {
    json: { email, password }, timeout: TIMEOUT_MS
  }));
};

const requestAuthLogout = (accessToken: string, cookie: string[]) => {
  return (request('POST', SERVER_URL + '/auth/logout', {
    headers: {
      Cookie: cookie,
      Authorization: `Bearer ${accessToken}`
    }
  }));
};
