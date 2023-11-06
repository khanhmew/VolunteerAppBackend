import mongoose, { Document, Schema } from 'mongoose';

export interface IFollow {
    followerId: string;
    followingId: string; 
    createdAt: Date; 
}

export interface IFollowModel extends IFollow, Document { }

const IFollowSchema: Schema = new Schema(
    {
        followerId: { type: Schema.Types.ObjectId, required: true },
        followingId: { type: Schema.Types.ObjectId,required: true },
        createdAt: { type: Date, default: Date.now },
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IFollowModel>('Follow', IFollowSchema);

export const DefaultUserData = (followerId: string, followingId: string) => {
    const iFollow: IFollow = {
        followerId: followerId,
       followingId: followingId,
       createdAt: new Date()
    }
    return iFollow;
}