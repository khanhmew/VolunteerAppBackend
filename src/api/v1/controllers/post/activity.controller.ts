import { NextFunction, Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { getImageSize, uploadImageFromFormData } from "../../services/firebase.service";
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../../shared/error/post.error";
import { ActivityService } from "../../services/activity.service";

declare global {
    namespace Express {
        interface Request {
            files?: any
        }
    }
}
export class ActivityController {
    postServiceInstance!: PostService;
    activityServiceInstance!: ActivityService;

    constructor() {
        this.postServiceInstance = new PostService();
        this.activityServiceInstance = new ActivityService();
    }

    joinActivity = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userJoinId = req.user.userId;
            const activityId = req.params.activityId;
            const joinResult: any =await this.activityServiceInstance.joinActivity(userJoinId, activityId);
            if (joinResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Join success', {totalUserJoin: joinResult.numOfPeopleParticipated}));
            }
            else if(joinResult.error){
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, joinResult.error, null));
            }
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }

    getDetailsOfJoinedActivities = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userForGetAct = req.user.userId;
            const joinResult: any=await this.activityServiceInstance.getDetailsOfJoinedActivities(userForGetAct);
            if (joinResult) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Join success', joinResult));
            }
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }

    getDetailsOfCreatedActivities = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orgForGetAct = req.user.userId;
            const createResult: any=await this.activityServiceInstance.getDetailsOfCreatedActivities(orgForGetAct);
            if (createResult) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Join success', createResult));
            }
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }

    attendance = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userAttend = req.user.userId;
            const postId = req.params.postId;
            const joinResult: any=await this.activityServiceInstance.attendnace(postId, userAttend);
            if (joinResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Attendace success', joinResult.join));
            }
            else{
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, joinResult.error, null));
            }
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }


    getAllUserJoinAct =  async (req: Request, res: Response, next: NextFunction) => {
        try {
            const activityId = req.params.activityid;
            const allUsers: any=await this.activityServiceInstance.getAlluserJoin(activityId);
            if (allUsers.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', allUsers.users));
            }
            else{
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, allUsers.error, null));
            }
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }

    getAllUserAttendanceAct =  async (req: Request, res: Response, next: NextFunction) => {
        try {
            const activityId = req.params.activityid;
            const allUsers: any=await this.activityServiceInstance.getAlluserAttendance(activityId);
            if (allUsers.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', allUsers.users));
            }
            else{
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, allUsers.error, null));
            }
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }
}
