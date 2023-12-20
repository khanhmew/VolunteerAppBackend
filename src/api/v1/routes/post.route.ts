import express from 'express';
import { PostController } from '../controllers/post/post.controller';
import { ActivityController } from '../controllers/post/activity.controller'
import { authenticateToken } from '../../../middleware/token.middleware';
import { PostRedisController } from '../controllers/post/postRedis.controller';
import {SearchController  } from '../controllers/search/search.controller';
const postRoute = express.Router();
const postControllerInstance = new PostController();
const activityControllerInstance = new ActivityController();
const postRedisControllerInstance = new PostRedisController();
const searchController = new SearchController();

const multer = require('multer');

const storage = multer.memoryStorage(); // Sử dụng memory storage để tránh giới hạn kích thước tệp

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Đặt giới hạn kích thước tệp lên (ví dụ: 10MB)
});

postRoute.post('/post', authenticateToken, upload.array('images', 5), postControllerInstance.createPost);
postRoute.get('/posts', authenticateToken,postControllerInstance.getAllPost)
postRoute.get('/posts/address', authenticateToken,postControllerInstance.getPostsNearest)
postRoute.get('/posts/:orgId',authenticateToken, postControllerInstance.getAllPostById)
postRoute.get('/post/:postId', authenticateToken,postControllerInstance.getDetailPost)

//get post that user follow
postRoute.post('/posts/follows', authenticateToken,postControllerInstance.getAllPostUserFollow)

//#region Activity
// postRoute.put('/activity/:activityId', authenticateToken,activityControllerInstance.joinActivity)
//#endregion


//#region Post react
postRoute.post('/post/like', authenticateToken, postRedisControllerInstance.likeAPost);
postRoute.get('/post/likes/:postId', postRedisControllerInstance.getAllLikePost);
postRoute.put('/post/unlike', authenticateToken,postRedisControllerInstance.unlikeAPost);
postRoute.get('/post/like/:postId', authenticateToken,postRedisControllerInstance.checkUserLikePost);
//#endregion

//get 10 user create most post in a month ago
postRoute.get('/user/productive-activities',postControllerInstance.getAllTopOrgCreatePost);
//get 10 post user join most
postRoute.get('/post-top/out-standing',postControllerInstance.getAllTopPostUserJoinMost);


//#region COMMENT
postRoute.post('/post/comment', authenticateToken, postControllerInstance.commentAPost);
postRoute.get('/post/:postId/comments', postControllerInstance.getAllComment);
//#endregion

//#region ADMIN
postRoute.get('/search-post', postControllerInstance.searchPost);
//#endregion ADMIN
postRoute.post('/search-es', searchController.search)
postRoute.post('/search-es/autocomplete', searchController.autoComplete)
export default postRoute;
