import mongoose from 'mongoose';
import Activity from '../activity/activity.entity';
import User from '../user/user.entity';
import { UserJoinedBefore } from '../../../../shared/error/activity.error';

export class ActivityRepository {
  createNewActivity = async (_post: any) => {
    const activitySave: any = new Activity({
      participants: _post.participants,
      participatedPeople: [],
      postId: _post._id,
      address: _post.address,
      numOfPeopleParticipated: 0
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

  //check user attend before
  hasUserJoinedActivity = async (_userId: any, _activityId: any) => {
    try {
      const activity = await Activity.findOne({ _id: _activityId });
      if (!activity) {
        return false;
      }
      const hasJoined = activity.participatedPeople.includes(_userId);
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
      const currentParticipants = activity.participatedPeople.length;
  
      if (currentParticipants >= maxParticipants.valueOf()) {
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
        const activity = await Activity.findById(activityId);
    
        if (!user || !activity) {
          return {error: 'User or Activity not found'};
        }
    
        if (activity.participatedPeople.includes(userId)) {
          return {error: 'User is already participating in this activity'};
        }
        if(activity.participants )
        activity.participatedPeople.push(user._id);
        activity.numOfPeopleParticipated = activity.participatedPeople.length;
        await activity.save();
        return {success: 'Join success'};
      } 
  }
  
}