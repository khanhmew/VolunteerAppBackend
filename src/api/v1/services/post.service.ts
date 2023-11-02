import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../shared/error/post.error";
import {
  ResponseBase,
  ResponseStatus,
} from "../../../shared/response/response.payload";
import { ActivityRepository } from "../repository/activity/activity.repository";
import { PostRepository } from "../repository/post/post.repository";
import { UserRepository } from "../repository/user/user.repository";



export class PostService {
  private readonly postRepository!: PostRepository;
  private readonly userRepository!: UserRepository;
  private readonly activityRepository!: ActivityRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
    this.activityRepository = new ActivityRepository();
  }

  async savePost(_post: any) {
    try {
      const postSave = await this.postRepository.savePost(_post);
      const orgInformationCreatePost: any = await this.userRepository.getExistOrgById(postSave.ownerId);
      const activityInformation: any = await this.activityRepository.getActivityById(postSave.activityId);
      const postInformation = {
        _id: postSave._id,
        type: postSave.type,
        ownerId: postSave.ownerId,
        ownerDisplayname: orgInformationCreatePost.fullname,
        ownerAvatar: orgInformationCreatePost.avatar,
        address: orgInformationCreatePost.address,
        updatedAt: postSave.updatedAt,
        scope: postSave.scope,
        content: postSave.content,
        media: postSave.media,
        activityId: postSave.activityId,
        numOfComment: postSave.numOfComment,
        commentUrl: postSave.commentUrl,
        participatedPeople: [],
        participants: activityInformation.participants
      }
      if (postSave) {
        return postInformation;
      }

    } catch (error: any) {
      if (error instanceof PostMustCreateByOrg) {
        throw new PostMustCreateByOrg('PostMustCreateByOrg');
      }
      else if (error instanceof ExpirationDateMustGreaterCurrentDate) {
        throw new ExpirationDateMustGreaterCurrentDate('ExpirationDateMustGreaterCurrentDate');
      }
      else if (error instanceof DateFormat) {
        throw new DateFormat('DateFormat');
      }
      else if (error instanceof ParticipantsMustGreaterThan0) {
        throw new ParticipantsMustGreaterThan0('ParticipantsMustGreaterThan0');
      }
      else if (error instanceof OrgNotActive) {
        throw new OrgNotActive('OrgNotActive');
      }
    }
  }
  async getAllPost(page: any, limit: any) {
    try {
      const allPosts: any = await this.postRepository.getAllPosts(page, limit);
      const postsInformation = allPosts.map((post: any) => ({
        _id: post._id,
        type: post.type,
        ownerId: post.ownerId,
        ownerDisplayname: post.fullname,
        ownerAvatar: post.avatar,
        address: post.address,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
        scope: post.scope,
        content: post.content,
        media: post.media,
        participatedPeople: post.participatedPeople
      }));
      return postsInformation;
    } catch (error) {
      console.log('Error when getting all posts:', error);
      throw error;
    }
  }
  
  async getAllPostByOrg(orgId: any,page: any, limit: any) {
    try {
      const allPosts: any = await this.postRepository.getAllPostsByOrg(orgId,page, limit);
      const postsInformation = allPosts.map((post: any) => ({
        _id: post._id,
        type: post.type,
        ownerId: post.ownerId,
        ownerDisplayname: post.fullname,
        ownerAvatar: post.avatar,
        address: post.address,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
        scope: post.scope,
        content: post.content,
        media: post.media,
        participatedPeople: post.participatedPeople
      }));
      return postsInformation;
    } catch (error) {
      console.log('Error when getting all posts:', error);
      throw error;
    }
  }

}
