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

    async getFollowersCount(orgId: any) {
        try {
            if (!isValidObjectId(orgId)) {
                return { error: 'Invalid orgId' };
            }
    
            const followersCount = await Follow.countDocuments({ followingId: orgId });
    
            return { success: 'Successfully retrieved followers count', followersCount };
        } catch (error) {
            console.error('Error getting followers count:', error);
            return { error: 'Failed to get followers count' };
        }
    }
    

    async countFollowersOfOrg(orgId: string) {
        try {
          const followersCount = await Follow.countDocuments({ followingId: orgId });
          return followersCount;
        } catch (error: any) {
          console.error('Error:', error.message);
          throw error;
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
    async getAllFollowingIds(userId: any) {
        try {
            // Sử dụng Mongoose để tìm tất cả các mục trong cơ sở dữ liệu với followerId là userId
            const relationships = await Follow.find({ followerId: userId });

            // Sử dụng phương thức map để trích xuất tất cả các followingId vào một mảng
            const followingIds = relationships.map((relationship) => relationship.followingId.toString());

            return followingIds;
        } catch (error) {
            console.error('Error getting followingIds:', error);
            throw error;
        }
    }
    async getOrgFollowersAndFollowingCount(orgId: any) {
        try {
            if (!isValidObjectId(orgId)) {
                return { error: 'Invalid orgId' };
            }
    
            const followersCount = await Follow.countDocuments({ followingId: orgId });
            const followingCount = await Follow.countDocuments({ followerId: orgId });
    
            return {
                success: 'Successfully retrieved followers and following count for the org',
                follow: {
                    follower: followersCount,
                    following: followingCount
                }
            };
        } catch (error) {
            console.error('Error getting org followers and following count:', error);
            return { error: 'Failed to get org followers and following count' };
        }
    }
}