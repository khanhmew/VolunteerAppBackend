import mongoose from 'mongoose';
import Activity from '../activity/activity.entity';
import User from '../user/user.entity';
import Join from '../activity/join.entity';
import Post from '../post/post.entity';
import { UserJoinedBefore } from '../../../../shared/error/activity.error';
import { sendVerificationEmail } from "../../services/firebase.service";
import { ActDTO } from '../../DTO/activity.dto';
import { generateQRCode } from "../../services/qrcode.service";
import { PostRepository } from '../post/post.repository';
import { getTotalLikesForPost, redisClient } from '../../../../redis/redisUtils';

export class ActivityRepository {
  createNewActivity = async (_post: any) => {
    const activitySave: any = new Activity({
      participants: _post.participants,
      participatedPeople: [],
      postId: _post.postId,
      address: _post.address,
      isExprired: false,
      exprirationDate: _post.exprirationDate,
      numOfPeopleParticipated: 0,
      dateActivity: _post.dateActivity,
      ownerId: _post.ownerId,
      isEnableQr: false,
      qrCode: await generateQRCode(_post._id)
    })
    await activitySave.save();
    return activitySave;
  }

  async isValidActivityId(activityId: string): Promise<boolean> {
    try {
      const activity = await Activity.findById(activityId);
      return !!activity;
    } catch (error) {
      console.error('Error checking activityId validity:', error);
      return false;
    }
  }
  getActivityById = async (_idActivity: String) => {
    try {
      const activityFind = await Activity.findOne({
        _id: _idActivity
      });
      return activityFind;
    } catch (error) {
      console.error('Error getting activity by ID:', error);
      throw error;
    }
  }

  hasExistJoin = async (_userId: any, _activityId: any) => {
    const joinExist = await Join.findOne({
      userId: _userId,
      activityId: _activityId
    });
    if (joinExist)
      return true;
    return false;
  }

  hasEmailJoinSend = async (_userId: any, _activityId: any) => {
    const joinExist = await Join.findOne({
      userId: _userId,
      activityId: _activityId
    });
    if (joinExist?.isEmailsend)
      return true;
    return false;
  }
  //check user attend before
  hasUserJoinedActivity = async (_userId: any, _activityId: any) => {
    try {
      const activity = await Activity.findOne({ _id: _activityId });
      if (!activity) {
        return false;
      }
      const hasJoined = await this.hasExistJoin(_userId, _activityId);
      return hasJoined;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  findPostBaseActId = async (_activityId: any) => {
    try {
      const post = await Post.findOne({ activityId: _activityId });
      if (!post) {
        return ({ error: 'Post not found' })
      }
      return post;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  findActIdBasePost = async (_postId: any) => {
    try {
      const activity = await Activity.findOne({ postId: _postId });

      if (!activity) {
        return { error: 'Activity not found' };
      }

      return activity._id;
    } catch (error) {
      console.error('Error:', error);
      return { error: error };
    }
  };


  checkMaxParticipants = async (activityId: any) => {
    try {
      const activity = await Activity.findById(activityId);

      if (!activity) {
        return { error: 'Activity not found' };
      }

      const maxParticipants = activity.participants;
      const currentParticipants = activity.numOfPeopleParticipated;

      if (currentParticipants as number >= maxParticipants.valueOf()) {
        return { error: 'This activity has reached its maximum participants limit' };
      }
      return { success: 'That activity can join now' };
    } catch (error) {
      throw error;
    }
  }

  joinActivity = async (userId: any, activityId: any) => {
    const checkCanJoin = await this.checkMaxParticipants(activityId);
    if (checkCanJoin.success) {
      const user = await User.findById(userId);
      if (user?.roleId == '656c9bda38d3d6f36ecc8eb6') {
        return { error: 'Organization can not join activity' };
      }
      const activity = await Activity.findById(activityId);

      if (!user || !activity) {
        return { error: 'User or Activity not found' };
      }
      const checkUserJoined = await this.hasExistJoin(userId, activityId);
      if (checkUserJoined) {
        return { error: 'User is already participating in this activity' };
      }
      if (activity.isExprired) {
        return { error: 'This activity is expried' };
      }
      if (activity.participants)
        var joinNew: any = new Join({
          activityId: activity._id,
          userId: userId,
          isAttended: false,
          timeAttended: new Date(),
        });
      joinNew.save();
      if (joinNew) {
        activity.numOfPeopleParticipated = activity.numOfPeopleParticipated as number + 1;
      }
      await activity.save();
      const PostInfor: any = await this.findPostBaseActId(activityId);
      const postSendMail: any = ({
        dateActivity: activity.dateActivity,
        content: PostInfor.content,
        address: activity.address,
        title: 'Nội dung chi tiết như sau:'
      })
      await sendVerificationEmail(user.email, postSendMail);
      const pattern = `posts_joined:page:*:userId:${userId}`;
      const keysToDelete = await redisClient.keys(pattern);

      if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
      }

      return { success: 'Join success', numOfPeopleParticipated: activity.numOfPeopleParticipated };
    }
  }

  isJoined = async (userId: any, activityId: any) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      const activity = await Activity.findById(activityId);
      if (!activity) {
        throw new Error('Activity not found');
      }
      const isUserJoined = await this.hasExistJoin(userId, activityId);
      return isUserJoined;
    } catch (error) {
      throw error;
    }
  }

  isJoinedAct = async (userId: any, activityId: any) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { error: 'User not found' }
      }
      const activity = await Activity.findById(activityId);
      if (!activity) {
        return { error: 'Activity not found' }
      }
      const isUserJoined = await this.hasExistJoin(userId, activityId);
      return { success: '', join: isUserJoined };
    } catch (error) {
      throw error;
    }
  }

  isAttended = async (_userId: any, _activityId: any) => {
    try {
      const user = await User.findById(_userId);
      if (!user) {
        throw new Error('User not found');
      }
      const activity = await Activity.findById(_activityId);
      if (!activity) {
        throw new Error('Activity not found');
      }
      const joinExist = await Join.findOne({
        userId: _userId,
        activityId: _activityId
      });
      if (joinExist?.isAttended)
        return true;
      return false;
    } catch (error) {
      throw error;
    }
  }
  checkAndSendMailForUser = async (userId: any, activityId: any, detailPost: any) => {
    try {
      const isSend = await this.hasEmailJoinSend(userId, activityId)
      if (!isSend) {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        await sendVerificationEmail(user.email, detailPost);
      }
    } catch (error) {
      throw error;
    }
  }


  async getDetailsOfJoinedActivities(userId: any) {
    try {
      const joinedActivities = await Join.find({ userId: userId });

      const detailedActivities = await Promise.all(
        joinedActivities.map(async (joinedActivity) => {
          const activityId = joinedActivity.activityId;
          const activityDetails = await Activity.findById(activityId);
          const postForGet = await Post.findOne({ activityId: activityId });
          const owner = await User.findOne({ _id: postForGet?.ownerId });
          const actDetails: ActDTO = ({
            _id: activityId,
            _postId: postForGet?._id,
            dateActivity: activityDetails?.dateActivity,
            media: postForGet?.media[0],
            ownerDisplayname: owner?.fullname
          })
          return actDetails;
        })
      );

      return detailedActivities;
    } catch (error) {
      console.error('Error getting details of joined activities:', error);
    }
  }

  async getDetailsOfActivitiesCreated(_orgId: any) {
    try {
      const createdActivities = await Activity.find({ ownerId: _orgId });

      const detailedActivities = await Promise.all(
        createdActivities.map(async (createdActivity) => {
          const activityId = createdActivity.id;
          const activityDetails = await Activity.findById(activityId);
          const postForGet = await Post.findOne({ activityId: activityId });
          const owner = await User.findOne({ _id: _orgId });
          const actDetails: ActDTO = ({
            _id: activityId,
            _postId: postForGet?._id,
            dateActivity: activityDetails?.dateActivity,
            media: postForGet?.media[0],
            ownerDisplayname: owner?.fullname
          })
          return actDetails;
        })
      );

      return detailedActivities;
    } catch (error) {
      console.error('Error getting details of joined activities:', error);
    }
  }

  getAllUserJoinAct = async (_activityId: any) => {
    try {
      const allJoins = Join.find({ activityId: _activityId });
      const allUsers = await Promise.all(
        (await allJoins).map(async (join) => {
          const user = await User.findOne({ _id: join.userId });
          const userResult = ({
            _id: join.userId,
            username: user?.username,
            avatar: user?.avatar
          })
          return userResult;
        })
      );
      return { success: 'Get success', users: allUsers }
    } catch (error) {
      return { error: error }
    }
  }

  getAllUserAttendanceAct = async (_activityId: any) => {
    try {
      const allJoins = Join.find({ activityId: _activityId , isAttended: true});
      const allUsers = await Promise.all(
        (await allJoins).map(async (join) => {
          const user = await User.findOne({ _id: join.userId });
          const userResult = ({
            _id: join.userId,
            username: user?.username,
            avatar: user?.avatar
          })
          return userResult;
        })
      );
      return { success: 'Get success', users: allUsers }
    } catch (error) {
      return { error: error }
    }
  }
}