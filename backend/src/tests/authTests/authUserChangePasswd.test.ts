import { requestDelete, requestAuthRegister, requestAuthLogin, requestUserChangePassword } from '../requestHelpers';

beforeEach(() => {
  requestDelete();
});

afterEach(() => {
  requestDelete();
});

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
