import { NextFunction, Request, Response } from "express";
import { ResponseBase, ResponseStatus } from "../shared/response/response.payload";

const jwt = require('jsonwebtoken');
const SECRETKEY = process.env.SECRETKEY ?? '';

declare global {
    namespace Express {
      interface Request {
        user?: any;
      }
    }
  }

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

  if (!token) {
    return ResponseBase(ResponseStatus.FAILURE, 'Unauthorized', null);
  }

  jwt.verify(token, SECRETKEY, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    
    next(); 
  });
}

