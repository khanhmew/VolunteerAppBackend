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
userRoute.put('/user', authenticateToken, upload.single('avatar'), userControllerInstance.updateUserProfile);
userRoute.put('/org/verify', authenticateToken, upload.array('images', 5), userControllerInstance.verifyOrganiztion)
userRoute.get('/search-user', userControllerInstance.searchUser);


//#region Admin 
userRoute.get('/users',authenticateToken, userControllerInstance.getAllUsers);
userRoute.put('/user/ban/:userid',authenticateToken, userControllerInstance.banUser);
userRoute.put('/org/active/:orgid', authenticateToken, userControllerInstance.activeOrganiztion)
userRoute.get('/org/authen', authenticateToken, userControllerInstance.getAllOrgSendVerify)
userRoute.get('/org/:orgid', authenticateToken, userControllerInstance.getDetailOrg)
userRoute.post('/report', authenticateToken, userControllerInstance.solveReport)
userRoute.post('/reports', authenticateToken, userControllerInstance.getAllReport)
//#endregion Admin 

//#region Follow
userRoute.post('/user/follow', authenticateToken,userControllerInstance.followUser);
userRoute.post('/user/unfollow', authenticateToken,userControllerInstance.unfollowUser);
userRoute.get('/user/follow/:orgid', authenticateToken,userControllerInstance.countFollowOrg);
//#endregion


//region REPORT 
userRoute.post('/user/report', upload.array('images', 5), authenticateToken,userControllerInstance.sendReport);
//endregion REPORT 
export default userRoute;
