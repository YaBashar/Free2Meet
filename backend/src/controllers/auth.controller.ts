import { Request, Response } from 'express';
import { registerUser, userLogin, authRefresh, requestResetPasswd, setResetPassword, userDetails, userLogout, userChangePasswords } from '../service/auth.service';

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const result = await registerUser(firstName, lastName, password, email);
    res.json({ userId: result }).status(200);
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { accessToken, refreshToken } = await userLogin(email, password);
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ token: accessToken }).status(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ error: 'Unauthorised' });

  const refreshToken = cookies.jwt;

  try {
    const result = await authRefresh(refreshToken);
    res.json({ token: result }).status(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const requestReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await requestResetPasswd(email);
    res.json({ resetToken: result }).status(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { userId, token, newPassword, confirmNewPasswd } = req.body;

  try {
    const result = await setResetPassword(userId, token, newPassword, confirmNewPasswd);
    res.json({ userId: result }).status(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const userInfo = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const result = await userDetails(userId);
    res.json({ user: result }).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ error: 'Cookie does not contain refresh token' });
  const refreshToken = cookies.jwt;

  try {
    const result = await userLogout(refreshToken, userId);
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { currentPassword, newPassword, confirmNewPasswd } = req.body;

  try {
    const result = await userChangePasswords(userId, currentPassword, newPassword, confirmNewPasswd);
    console.log(result);
    res.json({ userId: result }).status(200);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};
