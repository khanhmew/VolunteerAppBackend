import mongoose from 'mongoose';
import User, { IUser } from './user.entity';
import { AccountNotFoundError, WrongPasswordError } from '../../../../shared/error/auth.error';
import { uploadImageFromFormData } from '../../services/firebase.service';
const bcrypt = require('bcrypt');

export class UserRepository {
    saveUser = async (_user: IUser) => {
        // const hashedPassword = await bcrypt.hash(_user.password, 10);

        // const userToStore = new User({
        //     _id: new mongoose.Types.ObjectId(),
        //     fullname: _user.fullname,
        //     avatar: _user.avatar,
        //     email: _user.email,
        //     username: _user.username,
        //     password: hashedPassword,
        //     initTime: new Date()
        // });
        // return userToStore.save();
    }

    getUserByUsername = (_username: string) => {
        return User.findOne({
            username: _username
        }).select(['fullname', 'password', 'avatar', 'email']);
    }

    getExistUserByUsername = (_username: string) => {
        return User.findOne({
            username: _username
        }).select(['username']);
    }

    getExistUserById = async (_idUser: string) => {
        try {
            const user = await User.findOne({
                _id: _idUser
            }).select(['_id','phone','fullname', 'password', 'avatar', 'email', 'username']);  
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }


    getExistOrgById = async (_idUser: string) => {
        try {
            const user = await User.findOne({
                _id: _idUser
            }).select(['_id','phone','fullname', 'password', 'avatar', 'email', 'username', 'isActiveOrganization', 'imageAuthenticate']);  
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    updateUserProfile = async (oldUserId: any, newUser: any) => {
        const oldUser: any = await this.getExistUserById(oldUserId);
        const changes: Partial<IUser> = {};

        if (newUser.username !== oldUser.username && newUser.username !== null && newUser.username != '') {
            changes.username = newUser.username;
        }
        if (newUser.email !== oldUser.email && newUser.email !== null && newUser.email != '') {
            changes.email = newUser.email;
        }
        if (newUser.fullname !== oldUser.fullname && newUser.fullname !== null && newUser.fullname != '') {
            changes.fullname = newUser.fullname;
        }
        if (newUser.avatar !== oldUser.avatar && newUser.avatar !== null && newUser.avatar != '') {
            changes.avatar = newUser.avatar;
        }
        const passMatchWithOldPass = await bcrypt.compare(newUser.oldPassword , oldUser.password);
        console.log("Old user: " + oldUser);
        console.log("old pass " + newUser.oldPassword + " True or false: " + passMatchWithOldPass);
        if(passMatchWithOldPass){
            if (newUser.password !== null && newUser.password !== '') {
                if (oldUser.password && newUser.password) {
                    const passwordMatch = await bcrypt.compare(oldUser.password, newUser.password);
                    if (passwordMatch === false) {
                        const hashedPassword = await bcrypt.hash(newUser.password, 10);
                        changes.password = hashedPassword;
                    }
                }
            }
        }
        if(!passMatchWithOldPass){
            throw new WrongPasswordError('Password not match');
        }

        if (newUser.address !== oldUser.address) {
            changes.address = newUser.address;
        }

        if (newUser.phone !== oldUser.phone) {
            changes.phone = newUser.phone;
        }

        if (newUser.address !== oldUser.address) {
            changes.address = newUser.address;
        }

        if (Object.keys(changes).length > 0) {
            try {
                const updatedUser = await User.findByIdAndUpdate(
                    oldUser._id, // ID của người dùng cần cập nhật
                    changes, // Dữ liệu cần cập nhật
                    { new: true } // Tùy chọn để trả về người dùng đã cập nhật
                );
                const userResultForUpdate ={
                    _id: updatedUser?.id,
                    type: updatedUser?.type,
                    fullname: updatedUser?.fullname,
                    username: updatedUser?.username,
                    phone: updatedUser?.phone,
                    avatar: updatedUser?.avatar,
                    email: updatedUser?.email,
                    address: updatedUser?.address
                };
                return userResultForUpdate;
            } catch (error) {
                console.error('Error updating user:', error);
                throw error;
            }
        } else {
            return null;
        }
    };



    // editOrganizationProfile = (_organization: IUser) => {
    //     return 
    // }

    verifyOrganization = async (_orgId: string, _images: string[]) => {
        try {
          const orgForVerify: any = await this.getExistOrgById(_orgId);
          console.log('orgForVerify: ' + orgForVerify);       
          if (!orgForVerify) {
            throw new AccountNotFoundError('Organization not found');
          }
          if (orgForVerify.imageAuthenticate.length === 0) {
            orgForVerify.imageAuthenticate = [];
          }
          console.log('before: ' + orgForVerify.imageAuthenticate.length)  
          orgForVerify.imageAuthenticate.push(..._images);     
          const updatedOrg = await orgForVerify.save();   
          return updatedOrg;
        } catch (error) {
          console.error('Error verifying organization:', error);
          throw error;
        }
      }
    

}