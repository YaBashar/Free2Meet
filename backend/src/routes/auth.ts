import express from 'express';
import { verifyJWT } from '../middleware';
import * as authController from '../controllers/auth.controller';

export const authRouter = express.Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/request-reset', authController.requestReset);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.get('/user-details', verifyJWT, authController.userInfo);
authRouter.post('/logout', verifyJWT, authController.logout);
authRouter.put('/change-password', verifyJWT, authController.changePassword);
