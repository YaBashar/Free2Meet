import { requestAuthRegister, requestDelete, requestResetPasswd, requestSetNewPasswd } from '../requestHelpers';

let testUserId: string;
let resetToken: string;
beforeEach(() => {
  requestDelete();

  const res = requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
  const data = JSON.parse(res.body.toString());
  testUserId = data.userId;

  const res1 = requestResetPasswd('example@gmail.com');
  const data1 = JSON.parse(res1.body.toString());
  resetToken = data1.resetToken;
});

afterEach(() => {
  requestDelete();
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
