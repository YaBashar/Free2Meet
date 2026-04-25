import { Request, Response } from "express";
import {
  registerUser,
  userLogin,
  authRefresh,
  forgotPassword,
  resetPasswordService,
  verifyResetCodeService,
  resendResetCodeService,
  resendVerificationCode,
  userVerifyEmail,
  userLogout,
} from "../service/auth.service";

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const result = await registerUser({ firstName, lastName, password, email });
    res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await userLogin({ email, password });
    res.json(result).status(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.body?.refreshToken;

  try {
    const { accessToken, refreshToken: newRefreshToken } = await authRefresh(refreshToken);
    res.status(200).json({ accessToken: accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  const { verificationCode } = req.body;

  try {
    const result = await userVerifyEmail(verificationCode);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const resendVerifyEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const result = await resendVerificationCode(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const forgot = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await forgotPassword(email);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;

  try {
    const result = await resetPasswordService(resetCode, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  const { resetCode } = req.body;

  try {
    const result = await verifyResetCodeService(resetCode);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const resendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await resendResetCodeService(email);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = req.user?.sub;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Authentication Required" });
    }
    const result = await userLogout(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
