import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IReport {
    userSendId: string,
    orgReport: string,
    content: string,
    image: Array<String>,
    sendDate: Date,
    isSolved: boolean
}

export interface IReportModel extends IReport, Document { }

const IReportSchema: Schema = new Schema(
    {
        userSendId: {type: String, required: true},
        orgReport: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: Array<String>, required: true },
        isSolved: { type: Boolean, required: true, default: false},
        sendDate: { type: Date, required: true, default: Date.now },
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IReportModel>('Report', IReportSchema);