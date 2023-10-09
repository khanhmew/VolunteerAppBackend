import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface ILike {
    ownerId: String,
    postId: String
}

export interface ILikeModel extends ILike, Document { }

const ILikeSchema: Schema = new Schema(
    {
        ownerId: {type: String, required: true},
        postId: {type: String, required: true},
    },
    {
        versionKey: false
    }
);

export default mongoose.model<ILikeModel>('Post', ILikeSchema);

export const DefaultUserData = (ownerId: String, postId: String) => {
    const iLike: ILike = {
        ownerId: ownerId,
        postId: postId
    }
    return iLike;
}