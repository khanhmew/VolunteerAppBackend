import mongoose from 'mongoose';
import User, { IUser } from './user.entity';
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
    

    updateUserProfile = async (oldUserId: any, newUser: any) => {
        const oldUser: any = await this.getExistUserById(oldUserId);
        const changes: Partial<IUser> = {};

        if (newUser.username !== oldUser.username) {
            changes.username = newUser.username;
        }
        if (newUser.email !== oldUser.email) {
            changes.email = newUser.email;
        }
        if (newUser.fullname !== oldUser.fullname) {
            changes.fullname = newUser.fullname;
        }
        if (newUser.avatar !== oldUser.avatar) {
            changes.avatar = newUser.avatar;
        }
        if (newUser.password !== null && newUser.password !== '') {
            if (oldUser.password && newUser.password) {
                const passwordMatch = await bcrypt.compare(oldUser.password, newUser.password);
                if (passwordMatch === false) {
                    const hashedPassword = await bcrypt.hash(newUser.password, 10);
                    changes.password = hashedPassword;
                }
            }
        }

        if (newUser.address !== oldUser.address) {
            changes.address = newUser.address;
        }

        if (newUser.phone !== oldUser.phone) {
            changes.phone = newUser.phone;
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

    // verifyOrganiztion = (_organization: IUser) => {
    //     return
    // }

}