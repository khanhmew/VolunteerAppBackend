import express from 'express';
import { UserController } from '../controllers/user/user.controller';
import { authenticateToken } from '../../../middleware/token.middleware';
const userRoute = express.Router();
const userControllerInstance = new UserController();

userRoute.post('/user', authenticateToken, userControllerInstance.saveUserCallback);
userRoute.get('/user', userControllerInstance.getAll);

export default userRoute;
