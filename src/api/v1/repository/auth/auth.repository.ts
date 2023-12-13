import mongoose from 'mongoose';
import User, { IUser } from '../user/user.entity';
import { AccountNotFoundError, WrongPasswordError, EmailFormatError, PasswordFormatError, UsernameExistError } from '../../../../shared/error/auth.error';
import { OrgDTO } from '../../DTO/org.dto';
import { UserAdmin } from '../../DTO/userAdmin.dto';
import { FollowRepository } from '../follow/follow.repository';
import { PermissionRepository } from '../auth/permission.repository';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRETKEY = process.env.SECRETKEY ?? '';

export class AuthRepository {
  private readonly followRepository!: FollowRepository;
  private readonly permissionRepository!: PermissionRepository;
  constructor() {
    this.followRepository = new FollowRepository();
    this.permissionRepository = new PermissionRepository();
  }

  async authenticateAdmin(_username: String, _password: String) {
    try {
      const user = await User.findOne({ username: _username }).exec();

      if (!user) {
        throw new AccountNotFoundError('Account does not exist');
      }

      const passwordMatch = await bcrypt.compare(_password, user.password);

      if (passwordMatch) {
        const accessToken = jwt.sign({ username: user.username, userId: user._id }, SECRETKEY, {
          expiresIn: '1h',
        });

        const refreshToken = jwt.sign({ username: user.username, userId: user._id }, SECRETKEY, {
          expiresIn: '30d',
        });
        const typeUser = await this.permissionRepository.getTitleRole(user.roleId)
        const userRole = await this.permissionRepository.getPermissionARole(user.roleId)
        if (typeUser?.toLocaleLowerCase() === 'organization') {
          const totalFollow = await this.followRepository.countFollowersOfOrg(user._id);
          const orgResult: UserAdmin = {
            _id: user._id,
            type: 'Organization',
            fullname: user.fullname,
            avatar: user.avatar,
            email: user.email,
            username: user.username,
            phone: user.phone,
            address: user.address,
            sex: user.sex,
            imageAuthenticate: user.imageAuthenticate,
            isActiveOrganization: user.isActiveOrganization,
            follower: totalFollow,
            groupPermission: userRole,
            isEnable: user.isEnable
          };
          return { orgResult, accessToken, refreshToken };
        }
        else if(typeUser?.toLocaleLowerCase() === 'admin'){
          const adminResult : UserAdmin= {
            _id: user._id,
            type: 'Admin',
            fullname: user.fullname,
            avatar: user.avatar,
            email: user.email,
            username: user.username,
            phone: user.phone,
            address: user.address,
            sex: user.sex,
            groupPermission: userRole,
            isEnable: user.isEnable
          }
          return { adminResult, accessToken, refreshToken };
        }
        else if(typeUser?.toLocaleLowerCase() === 'super admin'){
          const superAdResult: UserAdmin = {
            _id: user._id,
            type: 'Super Admin',
            fullname: user.fullname,
            avatar: user.avatar,
            email: user.email,
            username: user.username,
            phone: user.phone,
            address: user.address,
            sex: user.sex,
            groupPermission: userRole,
            isEnable: user.isEnable
          }
          return { superAdResult, accessToken, refreshToken };
        }
      } else {
        throw new WrongPasswordError('Wrong password');
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      throw error;
    }
  }

  async authenticate(_username: String, _password: String) {
    try {
      const user = await User.findOne({ username: _username }).exec();;

      if (!user) {
        throw new AccountNotFoundError('Account does not exist');
      }

      const passwordMatch = await bcrypt.compare(_password, user.password);

      if (passwordMatch) {
        const accessToken = jwt.sign({ username: user.username, userId: user._id }, SECRETKEY, {
          expiresIn: '1h',
        });

        const refreshToken = jwt.sign({ username: user.username, userId: user._id }, SECRETKEY, {
          expiresIn: '30d',
        });
        const typeUser = await this.permissionRepository.getTitleRole(user.roleId)
        if (typeUser?.toLocaleLowerCase() === 'organization') {
          const totalFollow = await this.followRepository.countFollowersOfOrg(user._id);
          const orgResult: OrgDTO = {
            _id: user._id,
            type: 'Organization',
            fullname: user.fullname,
            avatar: user.avatar,
            email: user.email,
            username: user.username,
            phone: user.phone,
            address: user.address,
            sex: user.sex,
            imageAuthenticate: user.imageAuthenticate,
            isActiveOrganization: user.isActiveOrganization,
            follower: totalFollow,
            isEnable: user.isEnable
          };
          return { orgResult, accessToken, refreshToken };
        }
        else if(typeUser?.toLocaleLowerCase() === 'user'){
          const userResult = {
            _id: user._id,
            type: 'User',
            fullname: user.fullname,
            avatar: user.avatar,
            email: user.email,
            username: user.username,
            phone: user.phone,
            address: user.address,
            sex: user.sex,
            isEnable: user.isEnable
          }
          return { userResult, accessToken, refreshToken };
        }
      } else {
        throw new WrongPasswordError('Wrong password');
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      throw error;
    }
  }

  register = async (_user: IUser) => {
    const hashedPassword = await bcrypt.hash(_user.password, 10);
    if(_user.type.toLocaleUpperCase() == 'USER'){
      // const roleGet : any = await this.permissionRepository.getRoleID('USER');
      _user.roleId = "656d7f368f44963447c3ecf7"
    }
    else if(_user.type.toLocaleUpperCase() == 'ORGANIZATION'){
      _user.roleId = "656c9bda38d3d6f36ecc8eb6"
    }
    else{
      _user.roleId = "656c9cc238d3d6f36ecc8eb7"
    }
    const userToStore = new User({
      _id: new mongoose.Types.ObjectId(),
      // type: _user.type,
      fullname: _user.fullname,
      avatar: _user.avatar,
      email: _user.email,
      username: _user.username,
      password: hashedPassword,
      initTime: new Date(),
      address: _user.address,
      phone: _user.phone,
      sex: _user.sex,
      imageAuthenticate: [],
      isActiveOrganization: false,
      roleId: _user.roleId,
      isEnable: true
    });
    return userToStore.save();
  }

  findExistByUsername = async (_username: String) => {
    try {
      const user = await User.findOne({ username: _username }).exec();
      return user;
    } catch (error) {
      console.error('Error: ', error);
      throw error;
    }
  }

  getUserFromToken(token: any) {
    try {
      const decoded = jwt.verify(token, SECRETKEY);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  async getProfile(orgId: string, userId: string) {
    try {
      const user = await User.findById(orgId);

      if (!user) {
        throw new AccountNotFoundError('Profile not found');
      }
      const profile: any = {
        _id: user._id,
        type: user.type,
        fullname: user.fullname,
        avatar: user.avatar,
        email: user.email,
        username: user.username,
        phone: user.phone,
        address: user.address,
        sex: user.sex,
      };

      if (user.roleId == '656c9bda38d3d6f36ecc8eb6') {
        profile.type = 'Organization';
        profile.isActiveOrganization = user.isActiveOrganization;
        profile.imageAuthenticate = user.imageAuthenticate;
        const followers = await this.followRepository.countFollowersOfOrg(user._id);
        profile.followers = followers;
      }
      const isUserLoggedIn = !!userId;
      let isFollow: boolean | undefined = undefined;
      if (isUserLoggedIn) {
        isFollow = await this.followRepository.isUserFollowingOrg(userId, orgId);
        profile.isFollow = isFollow;
      }
      return profile;
    } catch (error: any) {
      console.error('Error:', error.message);
      throw error;
    }
  }


}