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
      return postSave; 

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
      else{
        console.log(error)
      }
    }
  }
  async getAllPost(page: any, limit: any, userId: any) {
    try {
      const allPosts: any = await this.postRepository.getAllPosts(page, limit, userId);
      return allPosts;
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
          activityId: post.activityId,
          exprirationDate: activityInformation.exprirationDate,
          isJoin,
          numOfComment: post.numOfComment,
          commentUrl: post.commentUrl,
          participants: activityInformation.participants,
          totalUserJoin: activityInformation.numOfPeopleParticipated,
          isExprired: activityInformation?.isExprired
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
          activityId: post.activityId,
          exprirationDate: activityInformation.exprirationDate,
          isJoin,
          numOfComment: post.numOfComment,
          commentUrl: post.commentUrl,
          participants: activityInformation.participants,
          totalUserJoin: activityInformation.numOfPeopleParticipated,
          isFollow: isUserFollowingOrg,
          isExprired: activityInformation?.isExprired
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

  async getNearbyPosts(_userId: any, _page:any, _limit: any) {
    const userInfo: any =await this.userRepository.getExistUserById(_userId);
    this.postRepository.getNearbyPosts(userInfo.address, _page, _limit)
    .then((nearbyPosts) => {return nearbyPosts})
    .catch((error) => console.error(error));
  }

  async commentAPost(_ownerId: any, _postId: any, _content: any){ 
      const commentResult = await this.postRepository.commentAPost(_ownerId, _postId,_content);
      return commentResult;
  }
  async replyAComment(_ownerId: any, _postId: any, _content: any, _parentCommentId: any){ 
    const commentResult = await this.postRepository.replyAComment(_ownerId, _postId,_content, _parentCommentId);
    return commentResult;
}
  async getAllCommentAPost(_postId: any, _page: any, _limit: any){
    try {
      const allComments: any = await this.postRepository.getAllCommentAPost(_postId,_page, _limit);
      const commentsInformation = await Promise.all(allComments.map(async (comment: any) => {
        const userInformationComment: any = await this.userRepository.getExistUserById(comment.ownerId);
        // Create a PostDTO without the likes and totalLikes fields
        const commentResult: commentDTO = {
          _id: comment._id,
          content: comment.content,
          createAt: comment.createAt,
          ownerId: comment.ownerId,
          postId: comment.postId,
          ownerAvatar: userInformationComment.avatar,
          ownerDisplayname: userInformationComment.fullname,
          parentId: comment.parentId
        };
        return commentResult;
      }));
      return commentsInformation;
    } catch (error) {
      console.log('Error when getting all posts:', error);
      throw error;
    }
  }
  
  async getOrgCreateMostPost(){
    try {
      const topUsers = await this.postRepository.getTopUsersByPostCountWithinLastMonth()
        return topUsers
    } catch (error) {
        return error
    }
  }

  async getTopPostUserJoin(){
    try {
      const topPosts = await this.postRepository.getTopPostsMostUserJoinWithinLastMonth()
        return topPosts
    } catch (error) {
        return error
    }
  }

  async searchPost(text: any){
    try {
      const searchPosts = await this.postRepository.searchPost(text);
        return searchPosts
    } catch (error) {
        return error
    }
  }
}
