import mongoose from 'mongoose';
import User, { IUser } from '../user/user.entity';
import { AccountNotFoundError, WrongPasswordError, EmailFormatError, PasswordFormatError, UsernameExistError } from '../../../../shared/error/auth.error';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRETKEY = process.env.SECRETKEY ?? '';

export class AuthRepository {
    async authenticate(_username: String, _password: String) {
        try {
          const user = await User.findOne({ username: _username }).exec();;
      
          if (!user) {
            throw new AccountNotFoundError('Account does not exist');
          }
      
          const passwordMatch = await bcrypt.compare(_password, user.password);
      
          if (passwordMatch) {
            const accessToken = jwt.sign({ username: user.username, userId: user._id }, SECRETKEY , {
              expiresIn: '1h',
            });

            const refreshToken = jwt.sign({ username: user.username, userId: user._id }, SECRETKEY, {
            expiresIn: '30d', 
          });
          const userResult = {
            _id: user._id,
            fullname: user.fullname,
            avatar: user.avatar,
            email: user.email,
            username: user.username,
          };
          return {userResult, accessToken, refreshToken };
          } else {
            throw new WrongPasswordError('Wrong password');
          }
        } catch (error: any) {
          console.error('Error:', error.message);
          throw error;
        }
      }
      
      register = async(_user: IUser) => {
        const hashedPassword = await bcrypt.hash(_user.password, 10);

        const userToStore = new User({
            _id: new mongoose.Types.ObjectId(),
            fullname: _user.fullname,
            avatar: _user.avatar,
            email: _user.email,
            username: _user.username,
            password: hashedPassword,
            initTime: new Date(),
            type: _user.type,
            isActiveOrganization: false,
            imageAuthenticate: '',
            phone: _user.phone
        });
        return userToStore.save();
    }

    findExistByUsername = async (_username: string) => {
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
}