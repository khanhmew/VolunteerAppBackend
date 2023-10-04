import express from 'express';
import { PostController } from '../controllers/post/post.controller';
import { authenticateToken } from '../../../middleware/token.middleware';
const postRoute = express.Router();
const postControllerInstance = new PostController();

const multer = require('multer');

const storage = multer.memoryStorage(); // Sử dụng memory storage để tránh giới hạn kích thước tệp

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Đặt giới hạn kích thước tệp lên (ví dụ: 10MB)
});

postRoute.post('/post', authenticateToken, upload.array('images', 5), postControllerInstance.createPost)
export default postRoute;
