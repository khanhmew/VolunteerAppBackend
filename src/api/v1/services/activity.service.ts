import { UserJoinedBefore } from "../../../shared/error/activity.error";
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../shared/error/post.error";
import {
  ResponseBase,
  ResponseStatus,
} from "../../../shared/response/response.payload";
import { ActivityRepository } from "../repository/activity/activity.repository";
import { PostRepository } from "../repository/post/post.repository";
import { UserRepository } from "../repository/user/user.repository";



export class ActivityService {
  private readonly postRepository!: PostRepository;
  private readonly userRepository!: UserRepository;
  private readonly activityRepository!: ActivityRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
    this.activityRepository = new ActivityRepository();
  }

  joinActivity = async(_userId: any, _activityId: any) => {
    try{
        const joinResult: any = await this.activityRepository.joinActivity(_userId, _activityId);
        return joinResult;
    }
    catch(error){
        console.log(error);
    }
  }

  getDetailsOfJoinedActivities = async (_userId: any) => {
    try {
      const detailedActivities = await this.activityRepository.getDetailsOfJoinedActivities(_userId);
      return detailedActivities;
    } catch (error) {
      console.error('Error:', error);
      throw error; // Nếu bạn muốn ném lỗi để nó được xử lý ở nơi gọi hàm
    }
  }
  
}
