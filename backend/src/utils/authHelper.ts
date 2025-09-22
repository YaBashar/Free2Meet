import validator from 'validator';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/userModel';

export function checkName(name: string): void {
  if (name.length < 2 || name.length > 20) {
    throw new Error('Name must be between 2 and 20 characters.');
  }

  if ((/[^a-zA-Z0-9 ]/).test(name)) {
    throw new Error('Name cannot contain special characters');
  }
}

export function checkPassword(password: string): void {
  if (password.length < 8) {
    throw new Error('password must be longer than 8 characters');
  }

  if (!((/[a-z]/).test(password) && (/[A-Z]/).test(password))) {
    throw new Error('password must containe upper and lower case characters');
  }

  if (!(/[^a-zA-Z0-9]/).test(password)) {
    throw new Error('password must contain a special character');
  }
}

export async function checkEmail(email: string): Promise<void> {
  if (!validator.isEmail(email)) {
    throw new Error('invalid email');
  }

  const existingEmail = await UserModel.findOne({ email: email });
  if (existingEmail) {
    throw new Error('Account already exists with email');
  }
}

export async function checkNewPasswd(previousPasswds: string[], newPassword: string, confirmNewPasswd: string): Promise<void> {
  try {
    checkPassword(newPassword);
    for (const passwd of previousPasswds) {
      if (await bcrypt.compare(newPassword, passwd)) {
        throw new Error('Password has been used before, try a new password');
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }

  if (confirmNewPasswd !== newPassword) {
    throw new Error('Passwords do not match');
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}
