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

describe('Error Case', () => {
  test('Invalid Token', () => {
    requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
    requestAuthLogin('example@gmail.com', 'Abcdefg123$');

    const res1 = requestAuthUserDetails('Invalid Token');
    const data1 = JSON.parse(res1.body.toString());
    expect(data1).toStrictEqual({ error: expect.any(String) });
    expect(res1.statusCode).toStrictEqual(401);
  });
});

describe('Success Case', () => {
  test('Success', () => {
    requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
    const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
    const data = JSON.parse(res.body.toString());
    const token = data.token;

    const res1 = requestAuthUserDetails(token);
    const data1 = JSON.parse(res1.body.toString());
    expect(data1).toStrictEqual({
      user: {
        userId: expect.any(String),
        name: expect.any(String),
        email: expect.any(String)
      }
    });

    expect(res1.statusCode).toStrictEqual(200);
  });
});

const requestAuthUserDetails = (token: string) => {
  return (request('GET', SERVER_URL + '/auth/user-details',
    { headers: { Authorization: `Bearer ${token}` } }
  ));
};

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
