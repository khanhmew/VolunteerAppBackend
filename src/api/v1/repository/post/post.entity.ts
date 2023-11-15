import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IPost {
    type: String,
    ownerId: String,
    createdAt: Date,
    updatedAt: Date,
    scope: String,
    content: String,
    media: Array<String>,
    numOfComment: Number,
    commentUrl: String,
    activityId: String,
    fundId: String,
}

export interface IPostModel extends IPost, Document { }

const IPostSchema: Schema = new Schema(
    {
        type: {type: String, require: true},
        ownerId: {type: String, required: true},
        createdAt: {type: Date, required: false},
        updatedAt: {type: Date, require: false},
        scope: {type: String, require: true},
        content: {type: String, require: true},
        media: {type: Array<String>, require: false},
        numOfComment: {type: Number, require: false},
        commentUrl: {type: String, require: false},
        activityId: {type: String, require: false},
        fundId: {type: String, require: false},
        
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IPostModel>('Post', IPostSchema);

export const DefaultPostData = (type: String,ownerId: String, exprirationDate: Date, scope: String, content: String, media: Array<String>, activityId: String, fundId: String) => {
    const iPost: IPost = {
        type: type,
        ownerId: ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
        scope: scope,
        content: content,
        media: media,
        numOfComment: 0,
        commentUrl: '',
        activityId: activityId,
        fundId: fundId,
       
    }
    return iPost;
}