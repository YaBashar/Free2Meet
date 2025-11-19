import { checkEmail, checkPassword, checkName, hashPassword, checkNewPasswd } from '../utils/authHelper';
import { UserModel } from '../models/userModel';

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/** [1] AuthRegister
  * Registers a user with an email, password, and name
**/

async function registerUser(firstName: string, lastName: string, password: string, email: string): Promise<string> {
  const name = firstName + ' ' + lastName;

  try {
    checkName(name);
    await checkEmail(email);
    checkPassword(password);
  } catch (error) {
    throw new Error(error.message);
  }

  const hashedPassword = await hashPassword(password);
  const newUser = new UserModel({
    name: name,
    password: hashedPassword,
    email: email,
    numSuccessfulLogins: 0,
    numfailedSinceLastLogin: 0,
    passwordHistory: [hashedPassword],
    refreshToken: [],
    resetToken: {
      token: undefined,
      expiresAt: -1
    },
  });

  await newUser.save();
  return newUser._id.toString();
}

/** [2] Auth Login
  * Logs in a user
**/

async function userLogin(email: string, password: string) {
  const user = await UserModel.findOne({ email: email });
  const isPassword = await bcrypt.compare(password, user.password);

  if (!user) {
    user.numfailedSinceLastLogin++;
    throw new Error('Email does not exist');
  }

  if (!isPassword) {
    user.numfailedSinceLastLogin++;
    throw new Error('Password is Incorrect');
  }

  user.numfailedSinceLastLogin = 0;
  user.numSuccessfulLogins++;

  const accessToken = jwt.sign(
    { userId: user._id, name: user.name, email: user.email },
    SECRET,
    { expiresIn: '10m' });

  const refreshToken = jwt.sign(
    { userId: user._id, name: user.name, email: user.email },
    REFRESH_SECRET,
    { expiresIn: '1d' }
  );

  user.refreshTokens = [refreshToken];
  await user.save();
  return { accessToken, refreshToken };
}

/** [3] Auth Refresh
  * Allows user to stay loggedIn
**/
async function authRefresh(refreshToken: string) {
  const user = await UserModel.findOne({ refreshTokens: { $in: [refreshToken] } });

  if (!user) {
    throw new Error('Invalid Refresh token for user');
  }

  try {
    jwt.verify(refreshToken, REFRESH_SECRET);
  } catch (error) {
    // Delete Expired Refresh Token from User
    const refreshTokenIndex = user.refreshTokens.findIndex((rfToken) => rfToken === refreshToken);
    user.refreshTokens.splice(refreshTokenIndex, 1);
    throw new Error(error.message);
  }

  const accessToken = jwt.sign(
    { userId: user._id, name: user.name, email: user.email },
    SECRET,
    { expiresIn: '10m' });

  return accessToken;
}

/** [4] Auth Request Reset-Password
  * Allows user to get a link or code to then reset password
**/
async function requestResetPasswd(email:string) {
  const currUser = await UserModel.findOne({ email: email });

  if (!currUser) {
    throw new Error('Email does not exist');
  }

  const resetToken = {
    token: crypto.randomBytes(32).toString('hex'),
    expiresAt: Date.now() + 10 * 1000 * 60
  };

  currUser.resetToken = resetToken;
  await currUser.save();
  return resetToken.token;
}

/** [5] Auth Reset-Password
  * Allows user to reset password
**/
async function setResetPassword(userId: string, rsToken: string, newPassword: string, confirmNewPasswd: string) {
  const currUser = await UserModel.findById(userId);

  if (!currUser) {
    throw new Error('User with userId does not exist');
  }

  const resetToken = currUser.resetToken;
  if (resetToken.token !== rsToken) {
    throw new Error('Invalid Reset Token');
  }

  if (resetToken.expiresAt < Date.now()) {
    throw new Error('Reset token expired');
  }

  const previousPasswds = currUser.passwordHistory;
  await checkNewPasswd(previousPasswds, newPassword, confirmNewPasswd);
  newPassword = await hashPassword(newPassword);

  // invalidate resetToken after setting new password
  currUser.resetToken = {
    token: undefined,
    expiresAt: Date.now()
  };

  currUser.password = newPassword;
  currUser.passwordHistory = [newPassword, ...(previousPasswds || [])];
  await currUser.save();
  return currUser._id.toString();
}

async function userDetails(userId: string) {
  const currUser = await UserModel.findById(userId);

  if (!currUser) {
    throw new Error('User Id Invalid');
  }

  return {
    userId: currUser._id,
    name: currUser.name,
    email: currUser.email
  };
}

// Allows loggedIn User to change their password
async function userChangePasswords(userId: string, currentPassword: string, newPassword: string, confirmNewPasswd: string) {
  const currUser = await UserModel.findById(userId);

  if (!currUser) {
    throw new Error('User with userId does not exist');
  }

  if (!bcrypt.compareSync(currentPassword, currUser.password)) {
    throw new Error('Incorrect current password');
  }

  const previousPasswds = currUser.passwordHistory;
  await checkNewPasswd(previousPasswds, newPassword, confirmNewPasswd);
  newPassword = await hashPassword(newPassword);
  currUser.password = newPassword;
  currUser.passwordHistory = [newPassword, ...(previousPasswds || [])];
  await currUser.save();
  return currUser._id.toString();
}

async function userLogout(refreshToken: string, userId: string) {
  const user = await UserModel.findById(userId);

  let tokens = user.refreshTokens;
  const tokenIndex = tokens.findIndex((token) => (token === refreshToken));
  const token = tokens[tokenIndex];
  if (!token) {
    throw new Error('Refresh Token does not exist for user');
  }

  tokens = tokens.splice(1, tokenIndex);
  return {};
}

export { registerUser, userLogin, setResetPassword, requestResetPasswd, authRefresh, userDetails, userLogout, userChangePasswords };
