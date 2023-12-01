import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface ILike {
    postId: String,
    ownerId: String, 
    createAt: Date
}

export interface ILikeModel extends ILike, Document { }

const ILikeSchema: Schema = new Schema(
    {
        postId: {type: String, require: true},
        ownerId: {type: String, required: true},
        createdAt: {type: Date, default: Date.now }
    },
    {
        versionKey: false
    }
);
export default mongoose.model<ILikeModel>('Like', ILikeSchema);
