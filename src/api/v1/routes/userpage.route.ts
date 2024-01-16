import express from 'express';
import { PostController } from '../controllers/post/post.controller';
import { ActivityController } from '../controllers/post/activity.controller'
import { authenticateToken } from '../../../middleware/token.middleware';
import { PostRedisController } from '../controllers/post/postRedis.controller';
import {SearchController  } from '../controllers/search/search.controller';
import { NotiController } from '../controllers/userpage/noti.controller';
const userPageRoute = express.Router();
const searchController = new SearchController();
const notiController = new NotiController();
//#endregion ADMIN
userPageRoute.post('/search-es', searchController.search)
userPageRoute.post('/search-es/autocomplete', searchController.autoComplete)
userPageRoute.get('/noties',authenticateToken, notiController.getAllNoti)
export default userPageRoute;
