import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IRole {
    title: string,
    description: string, 
    active: boolean, 
    createdAt: Date,
}

export interface IRoleModel extends IRole, Document { }

const IRoleSchema: Schema = new Schema(
    {
        title: {type: String, required: true},
        description: {type: String, required: true},
        active: {type: Boolean, require: true},
        createdAt: {type: Date, require: true},
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IRoleModel>('Role', IRoleSchema);

