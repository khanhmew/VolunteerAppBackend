import { Op } from 'sequelize';
import { UserRepository } from '../user/user.repository';
import { ActivityRepository } from '../activity/activity.repository';
import { initGroupModel } from './grouppg.entity'; // Thay đổi đường dẫn đến file của bạn
import { initMemberModel } from './memberpg.entity';
import { initMessageModel } from './message.entity';
import { initAdminChatModel } from './adminchat.entity';
import User from '../user/user.entity';
import { Sequelize, DataTypes, Model, QueryTypes } from 'sequelize';
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
  },
});
const Group = initGroupModel(sequelize);
const Member = initMemberModel(sequelize);
const Message = initMessageModel(sequelize)
const AdminChat = initAdminChatModel(sequelize)
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
      if (userType != "656c9bda38d3d6f36ecc8eb6") {
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

      //join owner
      const memberId = uuidv4();
      await Member.create({
        userid: createdBy,
        groupid: groupId,
        memberid: memberId,
        joinedat: new Date(),
      });

      return { success: 'Create success', group: newGroup };
    } catch (error: any) {
      return { error: error.message || 'An error occurred while creating the group' };
    }
  };

  adminChat = async (_admin: any) => {
    try {
      const { userId, adminid, userfullname, useravatar } = _admin;
      const _adminchatid = uuidv4(); // Generate a unique groupId

      const newChatAdmin = await AdminChat.create({
        userid: userId,
        adminid: adminid,
        adminchatid: _adminchatid,
        useravatar: useravatar,
        userfullname: userfullname
      });

      return { success: 'Create success', adminchat: newChatAdmin };
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

  sendMessage = async (userId: any, groupId: any, messageText: any, userImage: any) => {
    try {
      // const groupForJoin: any = await Group.findByPk(groupId);
      // if (!groupForJoin) {
      //   console.log('Group chat is not created')
      //   return { error: 'Group chat is not created' }
      // }
      const messageid = uuidv4();
      const newMessage = await Message.create({
        userid: userId,
        groupid: groupId,
        messageid: messageid,
        sendAt: new Date(),
        isRead: false,
        userImage: userImage,
        content: messageText
      });

      return { success: 'send mess to group success', message: newMessage };
    } catch (error) {
      return { error: error };
    }
  };

  // Get all groups that a user has joined
  getAllJoinedGroups = async (userId: any) => {
    try {
      const groupAllResult: any[] = [];

      // Query regular groups
      const joinedGroupsQuery = `
      SELECT Groups.groupid, Groups.name, Groups.avatar
      FROM Members
      LEFT JOIN Groups ON Members.groupid = Groups.groupid
      WHERE Members.userid = :userId
    `;
      const joinedGroups = await sequelize.query(joinedGroupsQuery, {
        replacements: { userId: userId },
        type: QueryTypes.SELECT as any,
      });
      groupAllResult.push(...joinedGroups);

      // Query admin chat groups
      const joinedGroupsQueryOnChatAdmin = `
      SELECT *
      FROM Adminchats
      WHERE Adminchats.userid = :userId
    `;
      const joinedChatAdmin = await sequelize.query(joinedGroupsQueryOnChatAdmin, {
        replacements: { userId: userId },
        type: QueryTypes.SELECT as any,
      });
      groupAllResult.push(...joinedChatAdmin);

      console.log('joinedChatAdmin:', joinedChatAdmin);
      return { success: 'Get joined groups success', group: groupAllResult };
    } catch (error: any) {
      return { error: error.message || 'An error occurred while getting joined groups' };
    }
  };

 // Get all groups that a user has joined
 getAllJoinedGroupsAdmin = async (adminId: any) => {
  try {
    const groupAllResult: any[] = [];

    // Query admin chat groups
    const joinedGroupsQueryOnChatAdmin = `
    SELECT *
    FROM Adminchats
    WHERE Adminchats.adminid = :userId
  `;
    const joinedChatAdmin = await sequelize.query(joinedGroupsQueryOnChatAdmin, {
      replacements: { userId: adminId },
      type: QueryTypes.SELECT as any,
    });
    groupAllResult.push(...joinedChatAdmin);
    return { success: 'Get joined groups success', group: groupAllResult };
  } catch (error: any) {
    return { error: error.message || 'An error occurred while getting joined groups' };
  }
};
}
