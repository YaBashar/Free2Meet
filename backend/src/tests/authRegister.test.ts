const request = require('sync-request-curl');
const { port, url } = require('../config.json');

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS })
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
});


const requestAuthRegister = (firstName: string, lastName: string, password: string, email: string) => {
    return (request('POST', SERVER_URL + '/auth/register', { 
       json: {firstName, lastName, password, email}, timeout: TIMEOUT_MS
    }));
}

describe("Error Cases", () => {

    describe("Test Email", () => {
        test('email address is already used by another user', () => {
            requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
            const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
            const data = JSON.parse(res.body.toString());

            expect(data).toStrictEqual({ error: expect.any(String) });
            expect(res.statusCode).toStrictEqual(400);
        });

        // email address does not satisfy isEmail
        test.each([
            'invalidunsw.edu.au', 'invalidemailslkcom',
            'invalid@emailcom', 'yrigushfsgpishfd',
            '34678893487', '#$%^&*()&*()',

        ])('invalid email address', (email) => {
            const res = requestAuthRegister(email, 'abcd1234', 'first', 'last');
            const data = JSON.parse(res.body.toString());

            expect(data).toStrictEqual({ error: expect.any(String) });
            expect(res.statusCode).toStrictEqual(400);
        });
    });


    describe("Test Name", () => {
        test.each([
            '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
            '_', '+', '=', '{', '[', '}', ']', '|', '\\', ':', ';', '"', '<', ',',
            '>', '.', '?', '/', '1',
        ])('first name containing invalid charcters', (char) => {
            const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first' + char, 'last');
            const data = JSON.parse(res.body.toString());

            expect(data).toStrictEqual({ error: expect.any(String) });
            expect(res.statusCode).toStrictEqual(400);
        });

        // FirstName is less than 2 characters or more than 20 characters.
        test.each([
            'a', ' ', 'abcdefghijklmnopqrstu',
            'abcdefghijk-lmnopqrstuvwxyz',
        ])('first name is an invalid length', (first) => {
            const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', first, 'last');
            const data = JSON.parse(res.body.toString());

            expect(data).toStrictEqual({ error: expect.any(String) });
            expect(res.statusCode).toStrictEqual(400);
        });


        // LastName contains characters other than lowercase
        // letters, uppercase letters, spaces, hyphens, or apostrophes.
        test.each([
            '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
            '_', '+', '=', '{', '[', '}', ']', '|', '\\', ':', ';', '"', '<', ',',
            '>', '.', '?', '/', '1',
        ])('last name containing invalid charcters', (char) => {
            const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last' + char);
            const data = JSON.parse(res.body.toString());

            expect(data).toStrictEqual({ error: expect.any(String) });
            expect(res.statusCode).toStrictEqual(400);
        });

        // NameLast is less than 2 characters or more than 20 characters.
        test.each([
            'a', ' ', 'abcdefghijklmnopqrstu',
            'abcdefghijk-lmnopqrstuvwxyz',
        ])('last name is an invalid length', (last) => {
            const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', last);
            const data = JSON.parse(res.body.toString());

            expect(data).toStrictEqual({ error: expect.any(String) });
            expect(res.statusCode).toStrictEqual(400);
        });

        describe('Testing password', () => {
            // Password is less than 8 characters.
            test('Invalid password length', () => {
                const res = requestAuthRegister('email@unsw.edu.au', 'abc123', 'first', 'last');
                const data = JSON.parse(res.body.toString());

                expect(data).toStrictEqual({ error: expect.any(String) });
                expect(res.statusCode).toStrictEqual(400);
            });

            // Password does not contain at least one number and at least one letter.
            test.each([
                'abcdefgh', '12345678', 'shfvfhj^&&*%', '253768%&^*',
            ])('Password does not contain at least one number and one letter', (password) => {
                const res = requestAuthRegister('email@unsw.edu.au', password, 'first', 'last');
                const data = JSON.parse(res.body.toString());

                expect(data).toStrictEqual({ error: expect.any(String) });
                expect(res.statusCode).toStrictEqual(400);
            });
        });
    });
})

describe("Success Cases", () => {
    
    // Register User
    // Validate User was added to db with get User Details
    test("Register User", () => {
        const result = requestAuthRegister("Mubashir", "Hussain", "SecurePassword123*", "Mubashirmh04@gmail.com")
        const data = JSON.parse(result.body.toString());

        expect(data.userId).toStrictEqual(expect.any(String))
        expect(result.statusCode).toStrictEqual(200);
    })
})

