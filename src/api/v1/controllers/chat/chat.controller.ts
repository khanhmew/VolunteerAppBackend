import { NextFunction, Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { ActivityService } from "../../services/activity.service";
import { ChatService } from "../../services/chat.service";
import { uploadImageFromFormData } from "../../services/firebase.service";
import { group } from "console";

declare global {
    namespace Express {
        interface Request {
            file?: any;
            user?: any;
            files?: any
        }
    }
}
export class ChatController {
    postServiceInstance!: PostService;
    activityServiceInstance!: ActivityService;
    chatServiceInstance!: ChatService;

    constructor() {
        this.postServiceInstance = new PostService();
        this.activityServiceInstance = new ActivityService();
        this.chatServiceInstance = new ChatService();
    }

    createGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newGroup: any = {
                createdBy: req.user.userId,
                activityId: req.body.activityId,
                name: req.body.name,
            }
            if (req.file) {
                const uploadedFile = req.file;
                const remoteFileName = `groups/${newGroup.activityId +'_' + uploadedFile.originalname}`;
                const imageUrl = await uploadImageFromFormData(uploadedFile, remoteFileName);

                newGroup.avatar = imageUrl;
            }

            const createResult: any = await this.chatServiceInstance.createGroup(newGroup);
            if (createResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, createResult.success, createResult.group));
            }
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, createResult.error, null));
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }

    createChatAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newGroup: any = {
                userId: req.user.userId,
                adminid: '656d81b9a46cff9f337c1a2d',
                userfullname: req.body.userfullname,
                useravatar: req.body.useravatar
            }
            const createResult: any = await this.chatServiceInstance.createChatAdmin(newGroup);
            if (createResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, createResult.success, createResult.group));
            }
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, createResult.error, null));
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }
    joinGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userJoin = req.user.userId;
            const groupJoin = req.params.groupId;

            const joinResult: any = await this.chatServiceInstance.joinGroup(userJoin, groupJoin);
            console.log(`Response join group ${JSON.stringify(joinResult)}`)
            if (joinResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, joinResult.success, joinResult.member));
            }
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, joinResult.error, null));
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }

    getAllGroupUserJoin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userForGet = req.user.userId;
            const groupResult: any = await this.chatServiceInstance.getAllGroupUserJoined(userForGet);
            console.log(`Response join group ${JSON.stringify(groupResult)}`)
            if (groupResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, groupResult.success, groupResult.group));
            }
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, groupResult.error, null));
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }

    getAllGroupUserJoinAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userForGet = req.user.userId;
            const groupResult: any = await this.chatServiceInstance.getAllGroupUserJoinedAdimin(userForGet);
            console.log(`Response join group ${JSON.stringify(groupResult)}`)
            if (groupResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, groupResult.success, groupResult.group));
            }
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, groupResult.error, null));
        }
        catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }

}
