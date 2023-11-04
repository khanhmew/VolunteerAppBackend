import { NextFunction, Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { getImageSize, uploadAndProcessImage, uploadImageFromFormData } from "../../services/firebase.service";
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
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Join success', null));
            }
            else if(joinResult.error){
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, joinResult.error, null));
            }
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }

    }
}