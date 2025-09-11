import { requestDelete, requestAuthRegister, requestAuthLogin, requestAuthUserDetails } from '../requestHelpers';

beforeEach(() => {
  requestDelete();
});

afterEach(() => {
  requestDelete();
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
