import { Request, Response, NextFunction } from "express";
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
  reactivateAccount,
  deleteAccount,
} from "../service/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const result = await registerUser({ firstName, lastName, password, email });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const result = await userLogin({ email, password });
    res.json(result).status(200);
  } catch (error) {
    next(error);
  }
};

export async function refresh(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.body?.refreshToken;

  try {
    const { accessToken, refreshToken: newRefreshToken } = await authRefresh(refreshToken);
    res.status(200).json({ accessToken: accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { verificationCode } = req.body;

  try {
    const result = await userVerifyEmail(verificationCode);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resendVerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  try {
    const result = await resendVerificationCode(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const forgot = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    const result = await forgotPassword(email);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { resetCode, newPassword } = req.body;

  try {
    const result = await resetPasswordService(resetCode, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyResetCode = async (req: Request, res: Response, next: NextFunction) => {
  const { resetCode } = req.body;

  try {
    const result = await verifyResetCodeService(resetCode);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resendResetCode = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    const result = await resendResetCodeService(email);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.sub;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Authentication Required" });
    }
    const result = await userLogout(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteUserAccount = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.sub;
  try {
    const result = await deleteAccount(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export async function reactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const result = await reactivateAccount(email, password);

    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}
