import mongoose, { isValidObjectId } from 'mongoose';
import { UserRepository } from '../user/user.repository';
import { ActivityRepository } from '../activity/activity.repository';
import Follow from './follow.entity';
const moment = require('moment');

export class FollowRepository {
    private readonly userRepository!: UserRepository;
    private readonly activityRepository!: ActivityRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.activityRepository = new ActivityRepository();
    }

    async followUser(followerId: any, followingId: any) {
        try {
            if (!isValidObjectId(followingId)) {
                return { error: 'Invalid followingId' };
            }
            if (!isValidObjectId(followerId)) {
                return { error: 'Invalid followerId' };
            }
            const existingRelationship = await Follow.findOne({ followerId: followerId, followingId: followingId });

            if (existingRelationship) {
                return { error: 'You are already following this user' };
            }

            const newRelationship = new Follow({ followerId: followerId, followingId: followingId });
            await newRelationship.save();

            const followersCount = await Follow.countDocuments({ followingId: followingId });

            return { success: 'You are now following this user', followersCount };
        } catch (error) {
            console.error('Error following user:', error);
            return { error: 'Failed to follow the user' };
        }
    }

    async unfollowUser(followerId: any, followingId: any) {
        try {
            if (!isValidObjectId(followingId)) {
                return { error: 'Invalid followingId' };
            }

            const existingRelationship = await Follow.findOne({ followerId: followerId, followingId: followingId });

            if (!existingRelationship) {
                return { error: 'You are not following this user' };
            }

            await Follow.deleteOne({ _id: existingRelationship._id });

            const followersCount = await Follow.countDocuments({ followingId: followingId });

            return { success: 'You have unfollowed this user', followersCount };
        } catch (error) {
            console.error('Error unfollowing user:', error);
            return { error: 'Failed to unfollow the user' };
        }
    }

    async getOrgsFollowedByUser(userId: string) {
        try {
          const userFollowedOrgs = await Follow.find({ followerId: userId });
      
          return userFollowedOrgs;
        } catch (error) {
          console.error('Error when getting orgs followed by user:', error);
          throw error;
        }
      }
      
      async isUserFollowingOrg(userId: any, orgId: any) {
        try {
          const existingRelationship = await Follow.findOne({ followerId: userId, followingId: orgId });
          return !!existingRelationship;
        } catch (error) {
          console.error('Error checking if user is following org:', error);
          throw error;
        }
      }
}