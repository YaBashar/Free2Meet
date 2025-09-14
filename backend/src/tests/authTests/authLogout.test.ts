import { requestAuthLogin, requestAuthLogout, requestAuthRegister, requestDelete } from '../requestHelpers';

beforeEach(() => {
  requestDelete();
});

afterEach(() => {
  requestDelete();
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
