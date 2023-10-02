import mongoose, { Document, Schema } from 'mongoose';

export interface IUser {
    type: string;
    fullname: string;
    avatar: string;
    email: string;
    username: string;
    password: string;
    phone: string;
    initTime: Date;
    isActiveOrganization: boolean;
    imageAuthenticate: string;
    address: String;
    sex: String;
}

export interface IUserModel extends IUser, Document { }

const IUserSchema: Schema = new Schema(
    {
        type: {type: String, required: true},
        fullname: { type: String, required: true },
        avatar: { type: String, required: false },
        email: { type: String, required: true, unique: false },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: {type: String, required: true, unique: true},
        initTime: { type: Date, required: true },
        isActiveOrganization: {type: Boolean, required: false},
        imageAuthenticate: {type: String, required: false},
        address: {type: String, required: false},
        sex: {type: String, required: true}
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IUserModel>('User', IUserSchema);

export const DefaultUserData = (type: string, email: string, fullname: string, username: string, passwordHash: string, phone: string) => {
    const iUser: IUser = {
        type: type,
        email: email,
        fullname: fullname,
        username: username,
        phone: phone,
        avatar: '',
        initTime: new Date(),
        password: passwordHash,
        isActiveOrganization: false,
        imageAuthenticate: '',
        address: '',
        sex:''
    }
    return iUser;
}