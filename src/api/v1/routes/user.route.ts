import express from 'express';
import { UserController } from '../controllers/user/user.controller';
import { authenticateToken } from '../../../middleware/token.middleware';
const userRoute = express.Router();
const userControllerInstance = new UserController();

const multer = require('multer');

const storage = multer.memoryStorage(); // Sử dụng memory storage để tránh giới hạn kích thước tệp

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Đặt giới hạn kích thước tệp lên (ví dụ: 10MB)
});

//userRoute.post('/user', authenticateToken, userControllerInstance.saveUserCallback);
userRoute.get('/user',authenticateToken, userControllerInstance.getAll);
userRoute.put('/user', authenticateToken, upload.single('avatar'), userControllerInstance.updateUserProfile);
userRoute.put('/org', authenticateToken, upload.array('images', 5), userControllerInstance.verifyOrganiztion)
export default userRoute;
