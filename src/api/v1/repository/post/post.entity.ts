import mongoose, { Document, Schema } from 'mongoose';

export interface IPost {
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
}

export interface IPostModel extends IPost, Document { }

const IPostSchema: Schema = new Schema(
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
        imageAuthenticate: {type: String, required: false}
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IPostModel>('User', IPostSchema);

export const DefaultUserData = (type: string, email: string, fullname: string, username: string, passwordHash: string, phone: string) => {
    const iPost: IPost = {
        type: type,
        email: email,
        fullname: fullname,
        username: username,
        phone: phone,
        avatar: '',
        initTime: new Date(),
        password: passwordHash,
        isActiveOrganization: false,
        imageAuthenticate: ''
    }
    return iPost;
}