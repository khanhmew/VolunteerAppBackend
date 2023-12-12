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
    imageAuthenticate: Array<String>;
    address: String;
    sex: String;
    roleId: string;
    isEnable: boolean
}

export interface IUserModel extends IUser, Document { }

const IUserSchema: Schema = new Schema(
    {
        type: {type: String, required: false},
        fullname: { type: String, required: true },
        avatar: { type: String, required: false },
        email: { type: String, required: true, unique: false },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: {type: String, required: true, unique: true},
        initTime: { type: Date, required: true },
        isActiveOrganization: {type: Boolean, required: false},
        imageAuthenticate: { type: Array<String> , required: false},
        address: {type: String, required: false},
        sex: {type: String, required: false},
        roleId: {type: String, required: false},
        isEnable: {type: Boolean, required: true},
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IUserModel>('User', IUserSchema);