import { NextFunction, Request, Response } from "express";
import { ResponseBase, ResponseStatus } from "../shared/response/response.payload";

const jwt = require('jsonwebtoken');
export const SECRETKEY = process.env.SECRETKEY ?? '';

declare global {
    namespace Express {
      interface Request {
        user?: any;
      }
    }
  }

  export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
  
    if (token) {
      jwt.verify(token, SECRETKEY, (err: any, user: any) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
      });
    } else {
      // Không có token, tiếp tục chạy các middleware và xử lý tiếp theo
      next();
    }
  }
  

