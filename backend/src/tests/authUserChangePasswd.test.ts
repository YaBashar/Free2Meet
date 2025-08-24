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

const requestUserChangePassword = (token: string, currentPassword:string, newPassword: string, confirmNewPasswd: string) => {
  return (request('POST', SERVER_URL + '/auth/change-password', {
    headers: { Authorization: `Bearer ${token}` },
    json: { currentPassword, newPassword, confirmNewPasswd },
    timeout: TIMEOUT_MS
  }));
};

describe('Success', () => {
  test('Password Changed Successfully', () => {
    requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
    const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
    const data = JSON.parse(res.body.toString());
    const token = data.token;

    const res1 = requestUserChangePassword(token, 'Abcdefg123$', 'new123A%', 'new123A%');
    const data1 = JSON.parse(res1.body.toString());

    expect(data1).toStrictEqual({ userId: expect.any(String) });
    expect(res1.statusCode).toStrictEqual(200);
  });
});

describe('Errors', () => {
  let token: string;
  beforeEach(() => {
    requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
    const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
    const data = JSON.parse(res.body.toString());
    token = data.token;
  });

  test('Using Same password again', () => {
    const res = requestUserChangePassword(token, 'Abcdefg123$', 'Abcdefg123$', 'Abcdefg123$');
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Passwords do not match', () => {
    const res = requestUserChangePassword(token, 'Abcdefg123$', 'new123A%', 'new123A%d');
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const res = requestUserChangePassword('invalidToken', 'Abcdefg123$', 'new123A%', 'new123A%');
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
});
