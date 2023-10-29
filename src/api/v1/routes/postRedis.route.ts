import express from 'express';
const postRedis = express.Router();

import { saveLikeForPost, getTotalLikesForPost } from '../../../redis/redisUtils';
import { ResponseBase, ResponseStatus } from '../../../shared/response/response.payload';
import { authenticateToken } from '../../../middleware/token.middleware';
import { PostRedisController } from '../controllers/post/postRedis.controller';
const postRedisControllerInstance = new PostRedisController();

postRedis.post('/post/like', authenticateToken, postRedisControllerInstance.likeAPost);

postRedis.get('/post/likes/:postId', postRedisControllerInstance.getAllLikePost);

postRedis.put('/post/unlike', authenticateToken,postRedisControllerInstance.unlikeAPost);

postRedis.get('/post/like', authenticateToken,postRedisControllerInstance.checkUserLikePost);

export default postRedis;