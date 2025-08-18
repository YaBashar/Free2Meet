import { getData, setData } from "./dataStore";
import { UserDetails, Users } from "./interfaces";
import { checkEmail, checkPassword, checkName, hashPassword, checkNewPasswd } from "./authHelper";
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
        userId: id.toString(),
        name: name,
        password: hashedPassword,
        email: email,
        numSuccessfulLogins: 1,
        numfailedSinceLastLogin: 0,
        passwordHistory: [hashedPassword],
        refreshToken: []
    }

    store.users.push(newUser)
    setData(store)
    return newUser.userId;
}


/** [2] Auth Login
  * Logs in a user 
**/

function userLogin(email: string, password: string) {
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

    const accessToken = jwt.sign(
        { userId: user.userId, name: user.name, email: user.email}, 
        SECRET, 
        { expiresIn: '10m'});

    
    const refreshToken = jwt.sign(
        { userId: user.userId, name: user.name, email: user.email}, 
        SECRET, 
        { expiresIn: '1d'}
    )

    user.refreshToken = [refreshToken]
    return {accessToken, refreshToken};
}

/** [3] Auth Request Reset-Password
  * Allows user to get a link or code to then reset password
**/
function requestResetPasswd(email:string) {
    // TODO Later send resetToken to user Email
    const store = getData();
    const userIndex = store.users.findIndex((user) => (user.email === email));
    const currUser = store.users[userIndex];

    if (!currUser) {
        throw new Error("Email does not exist");
    }

    const SECRET = process.env.JWT_SECRET;
    const resetToken = jwt.sign( {userId: currUser.userId, email: currUser.email}, SECRET, {expiresIn: "15m"});
    return resetToken;
}

/** [4] Auth Reset-Password
  * Allows user to reset password
**/
function setResetPassword(userId: string, token: string, newPassword: string, confirmNewPasswd: string) {
    const store = getData();
    const userIndex = store.users.findIndex((user) => (user.userId === userId));
    const currUser = store.users[userIndex];

    if (!currUser) {
        throw new Error("User with userId does not exist");
    }

    const SECRET = process.env.JWT_SECRET;
    try {
        jwt.verify(token, SECRET)
    } catch (error) {
        throw new Error(error.message)
    }

    const previousPasswds = currUser.passwordHistory
    try {
        checkNewPasswd(previousPasswds, newPassword, confirmNewPasswd)
    } catch (error) {
        throw new Error(error.message)
    }

    newPassword = hashPassword(newPassword)
    const user: Users = {
        userId: currUser.userId,
        name: currUser.name,
        password: newPassword,
        email: currUser.email,
        numSuccessfulLogins: currUser.numSuccessfulLogins,
        numfailedSinceLastLogin: currUser.numfailedSinceLastLogin,
        passwordHistory: [newPassword, ...(previousPasswds || [])], 
        refreshToken: currUser.refreshToken
    }

    store.users.push(user)
    setData(store)
    return user.userId;
}

export { registerUser, userLogin, setResetPassword, requestResetPasswd};
