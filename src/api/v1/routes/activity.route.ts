import express from 'express';
import { ActivityController } from '../controllers/post/activity.controller'
import { authenticateToken } from '../../../middleware/token.middleware';
const activityRoute = express.Router();
const activityControllerInstance = new ActivityController();

//#region Activity
activityRoute.put('/activity/:activityId', authenticateToken,activityControllerInstance.joinActivity)
activityRoute.get('/activity/join', authenticateToken,activityControllerInstance.getDetailsOfJoinedActivities)
activityRoute.get('/activity/create', authenticateToken,activityControllerInstance.getDetailsOfCreatedActivities)
//#endregion


export default activityRoute;
