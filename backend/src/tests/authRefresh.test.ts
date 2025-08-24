import request from "sync-request-curl";
import {port, url} from '../config.json'

const SERVER_URL = `${url}:${port}`
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/clear', {timeout: TIMEOUT_MS});
})

afterEach(() => {
    request('DELETE', SERVER_URL + '/clear', {timeout: TIMEOUT_MS});
})

describe("Success Cases", () => {
    test("Success", () => {
        requestAuthRegister("Mubashir", "Hussain", "Abcdefg123$", "example@gmail.com")
        const res1 = requestAuthLogin("example@gmail.com", "Abcdefg123$");
        const cookie = res1.headers['set-cookie']

        const res2 = requestRefreshToken(cookie)
        const data = JSON.parse(res2.body.toString())
        expect(data).toStrictEqual({token: expect.any(String)})
        expect(res2.statusCode).toStrictEqual(200)
    })
});

describe("Error Cases", () => {

    test("Invalid Token", () => {
        const invalidCookie = "jwt=wrongRefreshToken";
        const res = requestRefreshToken([invalidCookie])
        const data = JSON.parse(res.body.toString())
        expect(data).toStrictEqual({error: expect.any(String)})
        expect(res.statusCode).toStrictEqual(400)
    });
    
});

const requestRefreshToken = (cookie: string[]) => {
    return(request('POST', SERVER_URL + '/auth/refresh', {
        headers: {
            Cookie: cookie
        }
    }))
}

const requestAuthRegister = (firstName: string, lastName: string, password: string, email: string) => {
    return (request('POST', SERVER_URL + '/auth/register', { 
       json: {firstName, lastName, password, email}, timeout: TIMEOUT_MS
    }));
}

const requestAuthLogin = (email: string, password: string) => {
    return (request('POST', SERVER_URL + '/auth/login', {
        json: {email, password}, timeout: TIMEOUT_MS
    }));
    
}