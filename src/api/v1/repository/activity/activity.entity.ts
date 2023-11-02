import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IActivity {
    postId: String,
    participants: Number,
    participatedPeople: Array<ObjectId>,
    address: String,
    numOfPeopleParticipated: Number
}

export interface IActivityModel extends IActivity, Document { }

const IActivitySchema: Schema = new Schema(
    {
        postId: {type: String, required: true},
        address: {type: String, required: true},
        participants: {type: Number, require: true},
        participatedPeople: {type: Array, require: true},
        numOfPeopleParticipated: {type: Number, require: false}
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IActivityModel>('Activity', IActivitySchema);

export const DefaultUserData = (postId: String, address: String) => {
    const iActivity: IActivity = {
        address: address,
        postId: postId,
        participants: 0,
        participatedPeople: [],
        numOfPeopleParticipated: 0
    }
    return iActivity;
}