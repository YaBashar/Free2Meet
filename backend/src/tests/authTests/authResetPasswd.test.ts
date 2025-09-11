import request from 'sync-request-curl';
import { port, url } from '../../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const requestAuthRegister = (firstName: string, lastName: string, password: string, email: string) => {
  return (request('POST', SERVER_URL + '/auth/register', {
    json: { firstName, lastName, password, email }, timeout: TIMEOUT_MS
  }));
};

const requestResetPasswd = (email:string) => {
  return (request('POST', SERVER_URL + '/auth/request-reset', {
    json: { email }, timeout: TIMEOUT_MS
  }));
};

const requestSetNewPasswd = (userId: string, token: string, newPassword: string, confirmNewPasswd: string) => {
  return (request('POST', SERVER_URL + '/auth/reset-password', {
    json: { userId, token, newPassword, confirmNewPasswd }
  }));
};

let testUserId: string;
let resetToken: string;
beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });

  const res = requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
  const data = JSON.parse(res.body.toString());
  testUserId = data.userId;

  const res1 = requestResetPasswd('example@gmail.com');
  const data1 = JSON.parse(res1.body.toString());
  resetToken = data1.resetToken;
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
});

describe('Success Cases', () => {
  test('Reset Password Successfully Login', () => {
    const res = requestSetNewPasswd(testUserId, resetToken, 'new123A*', 'new123A*');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ userId: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });
});

describe('Error Cases', () => {
  test('Using Same password again', () => {
    const res2 = requestSetNewPasswd(testUserId, resetToken, 'Abcdefg123$', 'Abcdefg123$');
    const data2 = JSON.parse(res2.body.toString());

    expect(data2).toStrictEqual({ error: 'Password has been used before, try a new password' });
    expect(res2.statusCode).toStrictEqual(400);
  });

  test('User Id does not exist', () => {
    const res2 = requestSetNewPasswd('1234', resetToken, 'new123A*', 'new123A*');
    const data = JSON.parse(res2.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res2.statusCode).toStrictEqual(400);
  });

  test('Passwords do not match', () => {
    const res2 = requestSetNewPasswd(testUserId, resetToken, 'new123A*', 'new1234A*');
    const data = JSON.parse(res2.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res2.statusCode).toStrictEqual(400);
  });
});
