import express from 'express';
import { ChatController } from '../controllers/chat/chat.controller';
import { authenticateToken } from '../../../middleware/token.middleware';
const chatRoute = express.Router();
const chatControllerInstance = new ChatController();

const multer = require('multer');

const storage = multer.memoryStorage(); // Sử dụng memory storage để tránh giới hạn kích thước tệp

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Đặt giới hạn kích thước tệp lên (ví dụ: 10MB)
});

chatRoute.post('/group', authenticateToken, upload.single('avatar'), chatControllerInstance.createGroup);
chatRoute.post('/group/member/:groupId', authenticateToken, chatControllerInstance.joinGroup);
chatRoute.get('/groups/join', authenticateToken, chatControllerInstance.getAllGroupUserJoin);

//region admin
chatRoute.post('/chat-admin', authenticateToken, chatControllerInstance.createChatAdmin);
chatRoute.get('/chat-admin/join', authenticateToken, chatControllerInstance.getAllGroupUserJoinAdmin);
export default chatRoute;
