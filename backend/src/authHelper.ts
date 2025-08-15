import { Store } from "./interfaces";
import validator from 'validator';
const bcrypt = require('bcrypt')


export function checkName(name: string): void {
    if (name.length < 2 || name.length > 20) {
        throw new Error('Name must be between 2 and 20 characters.');
    }

    if ((/[^a-zA-Z0-9 ]/).test(name)) {
        throw new Error('Name cannot contain special characters')
    }
}

export function checkPassword(password: string): void {

    if (password.length < 8) {
        throw new Error('password must be longer than 8 characters')
    }

    if(! ((/[a-z]/).test(password) && (/[A-Z]/).test(password))) {
        throw new Error('password must containe upper and lower case characters')
    }

    if(!(/[^a-zA-Z0-9]/).test(password) ) {
        throw new Error('password must contain a special character')
    }
}

export function checkEmail(store: Store, email: string): void {
    if(!validator.isEmail(email)) {
        throw new Error('invalid email')
    }

    const existingEmail = store.users.find((user) => user.email === email);
    if (existingEmail) {
        throw new Error('Account already exists with email')
    }
}

export function hashPassword(password: string): string {
    let hashedPassword
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, (err: Error | undefined, salt: string) => {
        if (err) throw err;

        bcrypt.hash(password, salt, (err : Error | undefined, hash: string) => {
            if (err) throw err;
            hashedPassword = hash;
        });
    });
    return hashedPassword
}