import { getData, setData } from "./dataStore";
import { Users } from "./interfaces";
import { checkEmail, checkPassword, checkName, hashPassword } from "./authHelper";


/** [1] adminAuthRegister
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

export { registerUser };

// Validate User credentials and sign JWT here
function userLogin() {

}

