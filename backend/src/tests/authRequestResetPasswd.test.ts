import request from "sync-request-curl";
import {port, url} from '../config.json'

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
    requestAuthRegister("Mubashir", "Hussain", "Abcdefg123$", "example@gmail.com");
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
});


const requestAuthRegister = (firstName: string, lastName: string, password: string, email: string) => {
    return (request('POST', SERVER_URL + '/auth/register', { 
       json: {firstName, lastName, password, email}, timeout: TIMEOUT_MS
    }));
}

const requestResetPasswd = (email:string) => {
	return (request('POST', SERVER_URL + '/auth/request-reset', {
		json: {email}, timeout: TIMEOUT_MS
	}));
};

describe("Error Case", () => {
    test("Email does not exist", () => {
		const res = requestResetPasswd("FakeEmail@gmail.com");
		const data = JSON.parse(res.body.toString())

		expect(data).toStrictEqual({error : expect.any(String)})
		expect(res.statusCode).toStrictEqual(400);
	});
});

describe("Success Case", () => {
	test("Successful Request", () => {
		const res = requestResetPasswd("example@gmail.com");
		const data = JSON.parse(res.body.toString())

		expect(data).toStrictEqual({resetToken: expect.any(String) });
		expect(res.statusCode).toStrictEqual(200);
	})
});