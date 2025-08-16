import { getData, setData } from "./dataStore";
import { Users } from "./interfaces";
import { checkEmail, checkPassword, checkName, hashPassword } from "./authHelper";
const bcrypt = require('bcrypt')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

/** [1] AuthRegister
  * Registers a user with an email, password, and name
**/

function registerUser(firstName: string, lastName: string, password: string, email: string): string {
    const store = getData()
    const name = firstName + ' ' + lastName

    try {
        checkPassword(password)
        checkEmail(store, email)
        checkName(name)
    } catch (error) {
        throw new Error(error.message)
    }

    const hashedPassword = hashPassword(password);
    const id = Date.now()

    const newUser: Users = {
        userId: id,
        name: name,
        password: hashedPassword,
        email: email,
        numSuccessfulLogins: 1,
        numfailedSinceLastLogin: 0,
        passwordHistory: [hashedPassword]
    }

    store.users.push(newUser)
    setData(store)
    return newUser.userId.toString();
}


/** [2] Auth Login
  * Logs in a user 
**/

function userLogin(email: string, password: string): string {
    const store = getData();
    const userIndex = store.users.findIndex((user) => (user.email === email)) ;
    const user = store.users[userIndex];
    const isPassword = bcrypt.compareSync(password, user.password);

    if (!user) {
        user.numfailedSinceLastLogin ++;
        throw new Error("Email does not exist");
    }

    if (!isPassword) {
        user.numfailedSinceLastLogin ++;
        throw new Error("Password is Incorrect");
    }

    user.numfailedSinceLastLogin = 0;
    user.numSuccessfulLogins ++;

    const token = jwt.sign({ userId: user.userId, name: user.name, email: user.email}, SECRET, { expiresIn: '12h'});
    return token;
}

export { registerUser, userLogin };
