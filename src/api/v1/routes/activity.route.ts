import express from 'express';
import { ActivityController } from '../controllers/post/activity.controller'
import { authenticateToken } from '../../../middleware/token.middleware';
const activityRoute = express.Router();
const activityControllerInstance = new ActivityController();

//#region Activity
activityRoute.put('/activity/:activityId', authenticateToken,activityControllerInstance.joinActivity)
activityRoute.get('/activity/join', authenticateToken,activityControllerInstance.getDetailsOfJoinedActivities)
activityRoute.get('/activity/create', authenticateToken,activityControllerInstance.getDetailsOfCreatedActivities)
activityRoute.post('/activity/attendance/:postId', authenticateToken,activityControllerInstance.attendance)
activityRoute.get('/activity/join/:activityid', authenticateToken,activityControllerInstance.getAllUserJoinAct)
activityRoute.get('/activity/attendance/:activityid', authenticateToken,activityControllerInstance.getAllUserAttendanceAct)
//#endregion


export default activityRoute;
