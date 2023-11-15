import mongoose from 'mongoose';
import Activity from '../activity/activity.entity';
import User from '../user/user.entity';
import Join from '../activity/join.entity';
import { UserJoinedBefore } from '../../../../shared/error/activity.error';

export class ActivityRepository {
  createNewActivity = async (_post: any) => {
    const activitySave: any = new Activity({
      participants: _post.participants,
      participatedPeople: [],
      postId: _post._id,
      address: _post.address,
      isExprired: false,
      exprirationDate: _post.exprirationDate,
      numOfPeopleParticipated: 0,
      dateActivity: _post.dateActivity
    })
    await activitySave.save();
    return activitySave;
  }

  getActivityById =  async(_idActivity: String) => {
    try {
      const activityFind =await Activity.findOne({
        _id: _idActivity
      });
      return activityFind;
    } catch (error) {
      console.error('Error getting activity by ID:', error);
      throw error;
    }
  }

  hasExistJoin = async(_userId: any, _activityId: any) => {
    const joinExist = await Join.findOne({
      userId: _userId,
      activityId:  _activityId
    });
    if(joinExist)
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

  checkMaxParticipants = async(activityId: any)  => {
    try {
      const activity = await Activity.findById(activityId);
  
      if (!activity) {
        return {error: 'Activity not found'};
      }
  
      const maxParticipants = activity.participants;
      const currentParticipants = activity.numOfPeopleParticipated;
  
      if (currentParticipants as number >= maxParticipants.valueOf()) {
        return {error: 'This activity has reached its maximum participants limit'};
      }
      return { success: 'That activity can join now' };
    } catch (error) {
      throw error;
    }
  }
  
  joinActivity =async (userId: any, activityId: any) => {
      const checkCanJoin = await this.checkMaxParticipants(activityId);
      if(checkCanJoin.success){
        const user = await User.findById(userId);
        if(user?.type.toLocaleLowerCase() == 'organization'){
          return {error: 'Organization can not join activity'};
        }
        const activity = await Activity.findById(activityId);
    
        if (!user || !activity) {
          return {error: 'User or Activity not found'};
        }
        const checkUserJoined = await this.hasExistJoin(userId, activityId);
        if (checkUserJoined) {
          return {error: 'User is already participating in this activity'};
        }
        if(activity.isExprired){
          return {error: 'This activity is expried'};
        }
        if(activity.participants)
        var joinNew: any = new Join({
          activityId: activity._id,
          userId: userId,
          isAttended: false,
          timeAttended: new Date()
        });
        joinNew.save();
        if(joinNew){
          activity.numOfPeopleParticipated = activity.numOfPeopleParticipated as number + 1;
        }
        await activity.save();
        return {success: 'Join success', numOfPeopleParticipated: activity.numOfPeopleParticipated};
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
  
}