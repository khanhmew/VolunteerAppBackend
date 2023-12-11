import { Op } from 'sequelize';
import { UserRepository } from '../user/user.repository';
import { ActivityRepository } from '../activity/activity.repository';
import { initGroupModel } from './grouppg.entity'; // Thay đổi đường dẫn đến file của bạn
import { initMemberModel} from './memberpg.entity';
import User from '../user/user.entity';
import { Sequelize, DataTypes, Model } from 'sequelize';
import { serverConfig } from '../../../../config/server.config';
import { v4 as uuidv4 } from 'uuid';


const sequelize = new Sequelize({
    dialect: 'postgres', // Specify your database dialect
    host: serverConfig.postgre.host,
    port: serverConfig.postgre.port,
    username: serverConfig.postgre.user,
    password: serverConfig.postgre.password,
    database: serverConfig.postgre.database,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Use only if you encounter certificate issues
      },
    },});
const Group = initGroupModel(sequelize);
const Member = initMemberModel(sequelize);
export class ChatRepository {
  private readonly userRepository!: UserRepository;
  private readonly activityRepository!: ActivityRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.activityRepository = new ActivityRepository();
  }


  isValidGroupId = async (_groupId: string): Promise<boolean> => {
    try {
      const group = await Group.findByPk(_groupId);
      return !!group;
    } catch (error) {
      return false;
    }
  };

  findGroupByActID = async (_userId: any, _activityId: any) => {
    try {
      const group: any = await Group.findOne({
        where: { activityid: _activityId },
      });

      if (group) {
        const isUserJoined = await this.hasExistJoin(_userId, group.groupid);
        return { success: 'ok', groupId: group.groupid, isJoinedGroup: isUserJoined };
      }
      return { error: 'Group not exist' };
    } catch (error) {
      console.log(error);
    }
  };

  hasExistJoin = async (_userId: any, _groupId: any) => {
    const joinExist = await Member.findOne({
      where: {
        userid: _userId,
        groupid: _groupId,
      },
    });
    return !!joinExist;
  };

  isJoinedGroup = async (userId: any, groupId: any) => {
    try {
    //   const user = await User.findByPk(userId);
    //   if (!user) {
    //     return { error: 'User not found' };
    //   }

      const group = await Group.findByPk(groupId);
      if (!group) {
        return { error: 'Group not found' };
      }

      const isUserJoined = await this.hasExistJoin(userId, groupId);
      return { success: '', join: isUserJoined };
    } catch (error) {
      throw error;
    }
  };

  createGroup = async (_group: any) => {
    try {
      const { createdBy, activityId, name, avatar } = _group;
  
      // Check if the activityId exists
      const isValidActivityId = await this.activityRepository.isValidActivityId(activityId);
      if (!isValidActivityId) {
        return { error: 'Invalid activityId' };
      }
  
      const checkInvalidGroup = await this.isValidGroupId(activityId);
      if (checkInvalidGroup) {
        return { error: 'Group already exists' };
      }
  
      // Check the type of the user
      const userType = await this.userRepository.getUserType(createdBy);
      if (userType !== 'Organization') {
        return { error: 'User must be of type Organization to create a group' };
      }
  
      const groupId = uuidv4(); // Generate a unique groupId
  
      const newGroup = await Group.create({
        createdby: createdBy,
        activityid: activityId,
        name,
        avatar,
        totaluser: 0,
        createdat: new Date(),
        isdelete: false,
        groupid: groupId,
      });
  
      return { success: 'Create success', group: newGroup };
    } catch (error: any) {
      return { error: error.message || 'An error occurred while creating the group' };
    }
  };

  joinGroup = async (userId: any, groupId: any) => {
    try {
      const groupForJoin: any = await Group.findByPk(groupId);
      if (!groupForJoin) return { error: 'Group chat is not created' };

      const isJoined: any = await this.activityRepository.isJoinedAct(userId, groupForJoin.activityid);
      if (isJoined.error) return { error: isJoined.error };
      if (isJoined.join && isJoined.join == false) return { error: 'User must join activity to join this chat' };

      const isJoinedGroup = await this.isJoinedGroup(userId, groupId);
      if (isJoinedGroup.error) return { error: isJoinedGroup.error };
      if (isJoinedGroup.join && isJoinedGroup.join == true) return { error: 'User has joined group before' };
      const memberId = uuidv4();
      const newMember = await Member.create({
        userid: userId,
        groupid: groupId,
        memberid: memberId,
        joinedat: new Date(),
      });

      return { success: 'Join group success', member: newMember };
    } catch (error) {
      return { error: error };
    }
  };
}
