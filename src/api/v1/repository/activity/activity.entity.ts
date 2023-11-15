import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IActivity {
    postId: String,
    participants: Number,
    address: String,
    numOfPeopleParticipated: Number,
    isExprired: Boolean,
    exprirationDate: Date
}

export interface IActivityModel extends IActivity, Document { }

const IActivitySchema: Schema = new Schema(
    {
        postId: {type: String, required: true},
        address: {type: String, required: true},
        participants: {type: Number, require: true},
        numOfPeopleParticipated: {type: Number, require: false},
        exprirationDate: {type: Date, require: true},
        isExprired: {type: Boolean, require: true}
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IActivityModel>('Activity', IActivitySchema);

export const DefaultUserData = (postId: String, address: String, exprirationDate: Date ) => {
    const iActivity: IActivity = {
        address: address,
        postId: postId,
        participants: 0,
        numOfPeopleParticipated: 0,
        exprirationDate: exprirationDate,
        isExprired: false 
    }
    return iActivity;
}