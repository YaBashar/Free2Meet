import request from "sync-request-curl";
import {port, url} from '../config.json'

const SERVER_URL = `${url}:${port}`
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/clear', {timeout: TIMEOUT_MS});
    requestAuthRegister("Mubashir", "Hussain", "Abcdefg123$", "example@gmail.com")
})

afterEach(() => {
    request('DELETE', SERVER_URL + '/clear', {timeout: TIMEOUT_MS});
})

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

})


describe('Success Cases', () => {
    test("Logged In Successfully", () =>{
        const res = requestAuthLogin("example@gmail.com", "Abcdefg123$")
        const data = JSON.parse(res.body.toString());
        expect(data).toStrictEqual({token: expect.any(String)})
        expect(res.statusCode).toStrictEqual(200)
    });

    test("Correct User LoggedIn", () =>{
        const res = requestAuthLogin("example@gmail.com", "Abcdefg123$")
        const data = JSON.parse(res.body.toString());
        const token = data.token;

        const res1 = requestAuthUserDetails(token)
        const data1 = JSON.parse(res1.body.toString())

        expect(data1).toStrictEqual({
            user: {
                userId: expect.any(String),
                name: 'Mubashir Hussain',
                email: 'example@gmail.com',
            }
        });
        
    });
})


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

const requestAuthUserDetails = (token: string) => {
    return (request('GET', SERVER_URL + '/auth/user-details', 
       {headers: {'Authorization': `Bearer ${token}`} }
    ));
}