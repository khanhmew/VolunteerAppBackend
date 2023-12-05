import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IPermission {
    title: string,
    description: string, 
    active: boolean, 
}

export interface IPermissionModel extends IPermission, Document { }

const IPermissionSchema: Schema = new Schema(
    {
        title: {type: String, required: true},
        description: {type: String, required: true},
        active: {type: Boolean, require: true},
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IPermissionModel>('Permission', IPermissionSchema);

