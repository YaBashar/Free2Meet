import 'dotenv/config';
import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET;

import { Request, Response, NextFunction } from 'express';

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) return res.status(401).json({ error: 'Unauthorised: No token proivded' });

  const token = authHeaders.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorised: Malformed JWT Token' });

  try {
    const decoded = jwt.verify(token, SECRET);
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

export { verifyJWT };
