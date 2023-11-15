import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IJoin {
    activityId: String,
    userId: String,
    isAttended:Boolean,
    timeAttended: Date,
    isEmailsend: Boolean
}

export interface IJoinModel extends IJoin, Document { }

const IJoinSchema: Schema = new Schema(
    {
        activityId: {type: String, required: true},
        userId: {type: String, required: true},
        timeAttended: {type: Date, require: false},
        isAttended: {type: Boolean, require: true},
        isEmailsend: {type: Boolean, require: false},
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IJoinModel>('Join', IJoinSchema);
