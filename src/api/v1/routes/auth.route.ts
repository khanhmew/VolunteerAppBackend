import express,{ NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/auth/auth.controller';
import { Router } from 'express';
import { RateLimit } from '../../../middleware/ratelimit.middleware';

const authRoute = Router();
const authControllerInstance = new AuthController();

authRoute.post('/login', RateLimit(1, 5),authControllerInstance.authenticateUser);
authRoute.post('/signup', authControllerInstance.signup);
export default authRoute;