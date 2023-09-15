import mongoose from 'mongoose';
import User, { IUser } from './user.entity';

const bcrypt = require('bcrypt');

export class UserRepository {
    saveUser = async(_user: IUser) => {
        const hashedPassword = await bcrypt.hash(_user.password, 10);

        const userToStore = new User({
            _id: new mongoose.Types.ObjectId(),
            fullname: _user.fullname,
            avatar: _user.avatar,
            email: _user.email,
            username: _user.username,
            password: hashedPassword,
            initTime: new Date()
        });
        return userToStore.save();
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

}