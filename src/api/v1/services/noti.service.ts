import mongoose from "mongoose";
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../shared/error/post.error";
import {
    ResponseBase,
    ResponseStatus,
} from "../../../shared/response/response.payload";
import { PostDTO } from "../DTO/post.dto";
import { ActivityRepository } from "../repository/activity/activity.repository";
import { FollowRepository } from "../repository/follow/follow.repository";
import { PostRepository } from "../repository/post/post.repository";
import { UserRepository } from "../repository/user/user.repository";
import { getLocationFromAddress } from "./location.service";
import { commentDTO } from "../DTO/comment.dto";
import { NotiRepository } from "../repository/notify/noti.repository";



export class NotiService {
    private readonly notiRepository!: NotiRepository;

    constructor() {
        this.notiRepository = new NotiRepository();
    }

    async getAllNoti (userId: any, page: any, limit: any){
        const allNoti = await this.notiRepository.getAllNoti(userId, page, limit);
        return allNoti;
    }
}
