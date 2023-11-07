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



export class PostService {
  private readonly postRepository!: PostRepository;
  private readonly userRepository!: UserRepository;
  private readonly activityRepository!: ActivityRepository;
  private readonly followRepository!: FollowRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
    this.activityRepository = new ActivityRepository();
    this.followRepository = new FollowRepository();
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
        exprirationDate: postSave.exprirationDate,
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
  async getAllPost(page: any, limit: any, userId: any) {
    try {
      const allPosts: any = await this.postRepository.getAllPosts(page, limit);
      const isUserLoggedIn = !!userId;
      const postsInformation = await Promise.all(allPosts.map(async (post: any) => {
        const orgInformationCreatePost: any = await this.userRepository.getExistOrgById(post.ownerId);
        let isJoin: boolean | undefined = undefined;
        let isUserFollowingOrg: boolean | undefined = undefined;
        if (isUserLoggedIn) {
          isJoin = await this.activityRepository.isJoined(userId, post.activityId);
          const userFollowedOrgs = await this.followRepository.getOrgsFollowedByUser(userId);
          isUserFollowingOrg = userFollowedOrgs.some((org: any) => org.followingId == post.ownerId);
        }
        const activityInformation: any = await this.activityRepository.getActivityById(post.activityId); 
        // Create a PostDTO without the likes and totalLikes fields
        const postDTO: Omit<PostDTO, 'likes' | 'totalLikes'> = {
          _id: post._id,
          type: post.type,
          ownerId: post.ownerId,
          ownerDisplayname: orgInformationCreatePost.fullname,
          ownerAvatar: orgInformationCreatePost.avatar,
          address: orgInformationCreatePost.address,
          updatedAt: post.updatedAt,
          createdAt: post.createdAt,
          scope: post.scope,
          content: post.content,
          media: post.media,
          participatedPeople: post.participatedPeople,
          activityId: post.activityId,
          exprirationDate: post.exprirationDate,
          isJoin,
          numOfComment: post.numOfComment,
          commentUrl: post.commentUrl,
          participants: activityInformation.participants,
          isFollow: isUserFollowingOrg,
          totalUserJoin: activityInformation.participatedPeople.length,
        };
        return postDTO;
      }));
  
      return postsInformation;
    } catch (error) {
      console.log('Error when getting all posts:', error);
      throw error;
    }
  }
  
  async getAllPostByOrg(userId: any, orgId: any, page: any, limit: any) {
    try {
      const allPosts: any = await this.postRepository.getAllPostsByOrg(orgId, page, limit);
      const isUserLoggedIn = !!userId;
      const postsInformation: PostDTO[] = await Promise.all(allPosts.map(async (post: any) => {
        const orgInformationCreatePost: any = await this.userRepository.getExistOrgById(post.ownerId);
        let isJoin: boolean | undefined = undefined;
        if (isUserLoggedIn) {
          isJoin = await this.activityRepository.isJoined(userId, post.activityId);
        }
        const activityInformation: any = await this.activityRepository.getActivityById(post.activityId);
        const postDTO: Omit<PostDTO, 'likes' | 'totalLikes'> = {
          _id: post._id,
          type: post.type,
          ownerId: post.ownerId,
          ownerDisplayname: orgInformationCreatePost.fullname,
          ownerAvatar: orgInformationCreatePost.avatar,
          address: orgInformationCreatePost.address,
          updatedAt: post.updatedAt,
          createdAt: post.createdAt,
          scope: post.scope,
          content: post.content,
          media: post.media,
          participatedPeople: post.participatedPeople,
          activityId: post.activityId,
          exprirationDate: post.exprirationDate,
          isJoin,
          numOfComment: post.numOfComment,
          commentUrl: post.commentUrl,
          participants: activityInformation.participants,
          totalUserJoin: activityInformation.participatedPeople.length,
        };
  
        return postDTO;
      }));
  
      return postsInformation;
    } catch (error) {
      console.log('Error when getting all posts:', error);
      throw error; 
    }
  }
  
  async getAllPostUserFollow(_page: any, _limit: any, _userId: any) {
    try {
      const allPosts: any = await this.postRepository.getAllPostUserFollow(_page, _limit, _userId);
      const isUserLoggedIn = !!_userId;
      const userFollowedOrgs = await this.followRepository.getOrgsFollowedByUser(_userId);
      const postsInformation: PostDTO[] = await Promise.all(allPosts.map(async (post: any) => {
        const orgInformationCreatePost: any = await this.userRepository.getExistOrgById(post.ownerId);
        const isUserFollowingOrg = userFollowedOrgs.some((org) => org.followingId == post.ownerId);
        let isJoin: boolean | undefined = undefined;
        if (isUserLoggedIn) {
          isJoin = await this.activityRepository.isJoined(_userId, post.activityId);
        }
        else{
          return {error: 'You must login for get'};
        }
        const activityInformation: any = await this.activityRepository.getActivityById(post.activityId);
        const postDTO: Omit<PostDTO, 'likes' | 'totalLikes'> = {
          _id: post._id,
          type: post.type,
          ownerId: post.ownerId,
          ownerDisplayname: orgInformationCreatePost.fullname,
          ownerAvatar: orgInformationCreatePost.avatar,
          address: orgInformationCreatePost.address,
          updatedAt: post.updatedAt,
          createdAt: post.createdAt,
          scope: post.scope,
          content: post.content,
          media: post.media,
          participatedPeople: post.participatedPeople,
          activityId: post.activityId,
          exprirationDate: post.exprirationDate,
          isJoin,
          numOfComment: post.numOfComment,
          commentUrl: post.commentUrl,
          participants: activityInformation.participants,
          totalUserJoin: activityInformation.participatedPeople.length,
          isFollow: isUserFollowingOrg
        };
  
        return postDTO;
      }));
  
      return {success: 'Get success', postsInformation};
    } catch (error) {
      return {error: error};
      throw error;
    }
  }

  
  async getDetaiPost(_postId: any, _userId: any) {
    try {
      const post: any = await this.postRepository.getDetailPost(_postId, _userId);
      return post;
    } catch (error) {
      console.log('Error when getting detail post:', error);
      throw error;
    }
  }
}
