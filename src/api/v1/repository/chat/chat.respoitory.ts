import mongoose, { isValidObjectId } from 'mongoose';
import { UserRepository } from '../user/user.repository';
import { ActivityRepository } from '../activity/activity.repository';
import Group from './group.entity';
import Member from './member.entity';
import User from '../user/user.entity';
const moment = require('moment');

export class ChatRepository {
    private readonly userRepository!: UserRepository;
    private readonly activityRepository!: ActivityRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.activityRepository = new ActivityRepository();
    }
    async isValidGroupId(_groupId: string): Promise<boolean> {
        try {
            const group = await Group.findById(_groupId);
            return !!group;
        } catch (error) {
            return false;
        }
    }

    async findGroupByActID(_userId: any,_activityId: any){
        try {
            const group = await Group.findOne({activityId: _activityId});
            if(group) 
            {
                const isUserJoined = await this.hasExistJoin(_userId, group._id);
                return {success: 'ok', groupId: group._id, isJoinedGroup: isUserJoined}
            }
            return {error:'Group not exist'};
        } catch (error) {
            console.log(error);
        }
    }

    hasExistJoin = async (_userId: any, _groupId: any) => {
        const joinExist = await Member.findOne({
          userId: _userId,
          groupId: _groupId
        });
        if (joinExist)
          return true;
        return false;
      }
    isJoinedGroup  = async (userId: any, groupId: any) => {
        try {
          const user = await User.findById(userId);
          if (!user) {
            return {error: 'User not found' }
          }
          const group = await Group.findById(groupId);
          if (!group) {
            return {error: 'Group not found' }
          }
          const isUserJoined = await this.hasExistJoin(userId, groupId);
          return {success: '', join: isUserJoined};
        } catch (error) {
          throw error;
        }
      }
    createGroup = async (_group: any) => {
        try {
            const { createdBy, activityId, name, avatar } = _group;

            // Check if the activityId exists
            const isValidActivityId = await this.activityRepository.isValidActivityId(activityId);
            if (!isValidActivityId) {
                return { error: 'Invalid activityId' };
            }
            const checkInvalidGroup = await this.isValidGroupId(activityId)
            if (checkInvalidGroup) {
                return { error: 'Group is exist' };
            }
            // Check the type of the user
            const userType = await this.userRepository.getUserType(createdBy);
            if (userType !== 'Organization') {
                return { error: 'User must be of type Organization to create a group' };
            }

            const newGroupForSave = new Group({
                createdBy,
                activityId,
                name,
                avatar,
            });

            await newGroupForSave.save();
            return { success: 'Create success', group: newGroupForSave };
        } catch (error: any) {
            return { error: error.message || 'An error occurred while creating the group' };
        }
    };
    joinGroup = async (userId: any, groupId: any) => {
        try {
            const groupForJoin = await Group.findById(groupId);
            if(!groupForJoin)
                return {error: 'Group chat is not created'}
            const isJoined: any = await this.activityRepository.isJoinedAct(userId, groupForJoin?.activityId);
            if(isJoined.error)
                return {error: isJoined.error}
            if(isJoined.join && isJoined.join == false)
                return {error: 'User must join activity to join this chat'}
            const isJoinedGroup = await this.isJoinedGroup(userId, groupId);
            if(isJoinedGroup.error)
                return{error: isJoinedGroup.error}
            if(isJoinedGroup.join && isJoinedGroup.join == true )
            return{error: 'User has joined group before'}
            const newMember = new Member({
                userId: userId,
                groupId: groupId
            })
            newMember.save();
            return {success: 'Join group success', member: newMember}
        } catch (error) {
            return {error: error}
        }    
    }
}