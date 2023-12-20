import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface INotify {
    postId: String,
    senderId: String, 
    receiveId: String,
    message: String,
    createAt: Date,
    actionLink: String,
    messageType: String,
    status: String,
    isSeen: boolean,
    activityId: String
}

export interface INotifyModel extends INotify, Document { }

const INotifySchema: Schema = new Schema(
    {
        postId: {type: String, require: false},
        senderId: {type: String, required: true},
        createdAt: {type: Date, default: Date.now },
        receiveId: {type: String, require: false},
        message: {type: String, require: true},
        actionLink: {type: String, require: true},
        messageType: {type: String, require: true},
        status: {type: String, require: true},
        isSeen: {type: Boolean, require: true},
        activityId: {type: String, require: false},
    },
    {
        versionKey: false
    }
);
export default mongoose.model<INotifyModel>('Notify', INotifySchema);
