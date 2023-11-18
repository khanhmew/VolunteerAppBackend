import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IComment {
    postId: String,
    ownerId: String, 
    parentId: String,
    content: String,
    createAt: Date
}

export interface ICommentModel extends IComment, Document { }

const ICommentSchema: Schema = new Schema(
    {
        postId: {type: String, require: true},
        ownerId: {type: String, required: true},
        createdAt: {type: Date, default: Date.now },
        parentId: {type: String, require: false},
        content: {type: String, require: true},
    },
    {
        versionKey: false
    }
);
export default mongoose.model<ICommentModel>('Comment', ICommentSchema);
