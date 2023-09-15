import mongoose, { Document, Schema } from 'mongoose';

export interface IUser {
    fullname: string;
    avatar: string;
    email: string;
    username: string;
    password: string;
    initTime: Date;
}

export interface IUserModel extends IUser, Document { }

const IUserSchema: Schema = new Schema(
    {
        fullname: { type: String, required: true },
        avatar: { type: String, required: false },
        email: { type: String, required: true, unique: false },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        initTime: { type: Date, required: true },
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IUserModel>('User', IUserSchema);

export const DefaultUserData = (email: string, fullname: string, username: string, passwordHash: string) => {
    const iUser: IUser = {
        email: email,
        fullname: fullname,
        username: username,
        avatar: '',
        initTime: new Date(),
        password: passwordHash
    }
    return iUser;
}