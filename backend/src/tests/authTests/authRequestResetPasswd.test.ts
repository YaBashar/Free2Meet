import { requestAuthRegister, requestDelete, requestResetPasswd } from '../requestHelpers';

beforeEach(() => {
  requestDelete();
  requestAuthRegister('Mubashir', 'Hussain', 'Abcdefg123$', 'example@gmail.com');
});

afterEach(() => {
  requestDelete();
});

describe('Error Case', () => {
  test('Email does not exist', () => {
    const res = requestResetPasswd('FakeEmail@gmail.com');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success Case', () => {
  test('Successful Request', () => {
    const res = requestResetPasswd('example@gmail.com');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ resetToken: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });
});
