import { Request, Response } from 'express';
import { clear } from '../utils/clear';

export const getClear = async (req: Request, res: Response) => {
  try {
    const result = await clear();
    res.json(result).status(200);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};
