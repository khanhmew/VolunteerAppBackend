import express,{ NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/auth/auth.controller';
import { Router } from 'express';
import { RateLimit } from '../../../middleware/ratelimit.middleware';
import { authenticateToken } from '../../../middleware/token.middleware';

const authRoute = Router();
const authControllerInstance = new AuthController();

authRoute.post('/login', RateLimit(1, 5),authControllerInstance.authenticateUser);
authRoute.post('/signup', authControllerInstance.signup);
authRoute.get('/checkUsername', authControllerInstance.checkUsernameExist);
authRoute.get('/profile/:orgId', authenticateToken,authControllerInstance.getProfile);

//#region ADMIN
authRoute.post('/login/admin', authenticateToken,authControllerInstance.authenticateAdmin);
//#endregion ADMIN
export default authRoute;