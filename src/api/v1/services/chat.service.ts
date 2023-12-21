import { UserJoinedBefore } from "../../../shared/error/activity.error";
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../shared/error/post.error";
import {
  ResponseBase,
  ResponseStatus,
} from "../../../shared/response/response.payload";
import { ActivityRepository } from "../repository/activity/activity.repository";
import { PostRepository } from "../repository/post/post.repository";
import { UserRepository } from "../repository/user/user.repository";
import { ChatRepository } from "../repository/chat/chat.respoitory";



export class ChatService {
  private readonly postRepository!: PostRepository;
  private readonly chatRepository!: ChatRepository;
  private readonly activityRepository!: ActivityRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.activityRepository = new ActivityRepository();
    this.chatRepository = new ChatRepository();
  }

  joinGroup = async(_userId: any, _activityId: any) => {
    try{
        const joinResult: any = await this.chatRepository.joinGroup(_userId, _activityId);
        return joinResult;
    }
    catch(error){
        console.log(error);
    }
  }

  getAllGroupUserJoined = async(_userId: any) => {
    try{
        const group: any = await this.chatRepository.getAllJoinedGroups(_userId);
        return group;
    }
    catch(error){
        console.log(error);
    }
  }

  getAllGroupUserJoinedAdimin = async(_adminId: any) => {
    try{
        const group: any = await this.chatRepository.getAllJoinedGroupsAdmin(_adminId);
        return group;
    }
    catch(error){
        console.log(error);
    }
  }

  createGroup = async(_group: any) => {
    try{
        const joinResult = await this.chatRepository.createGroup(_group);
        return joinResult
    }
    catch(error){
        console.log(error);
    }
  }

  createChatAdmin = async(_group: any) => {
    try{
        const joinResult = await this.chatRepository.adminChat(_group);
        return joinResult
    }
    catch(error){
        console.log(error);
    }
  }

}
