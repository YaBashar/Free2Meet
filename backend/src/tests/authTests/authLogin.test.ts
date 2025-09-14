import { requestAuthLogin, requestAuthRegister, requestAuthUserDetails, requestDelete } from '../requestHelpers';

beforeEach(() => {
  requestDelete();
  requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
});

afterEach(() => {
  requestDelete();
});

describe('Error Cases', () => {
  test('Email address does not exist', () => {
    const res = requestAuthLogin('zid2@unsw.edu.au', 'Abcdefg123$');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Incorrect password', () => {
    const res = requestAuthLogin('example@gmail.com', 'abcd123');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success Cases', () => {
  test('Logged In Successfully', () => {
    const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Correct User LoggedIn', () => {
    const res = requestAuthLogin('example@gmail.com', 'Abcdefg123$');
    const data = JSON.parse(res.body.toString());
    const token = data.token;

    const res1 = requestAuthUserDetails(token);
    const data1 = JSON.parse(res1.body.toString());

    expect(data1).toStrictEqual({
      user: {
        userId: expect.any(String),
        name: 'Mubashir Hussain',
        email: 'example@gmail.com',
      }
    });
  });
});
