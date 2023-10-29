import express from 'express';
const postRedis = express.Router();

import { saveLikeForPost, getTotalLikesForPost } from '../../../redis/redisUtils';
import { ResponseBase, ResponseStatus } from '../../../shared/response/response.payload';
import { authenticateToken } from '../../../middleware/token.middleware';
import { PostRedisController } from '../controllers/post/postRedis.controller';
const postRedisControllerInstance = new PostRedisController();

postRedis.post('/like', authenticateToken, postRedisControllerInstance.likeAPost);

postRedis.get('/likes/:postId', postRedisControllerInstance.getAllLikePost);

postRedis.post('/unlike', authenticateToken,postRedisControllerInstance.unlikeAPost);

export default postRedis;