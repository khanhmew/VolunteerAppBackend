import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IRolePermission {
    permissionId: string,
    roleId: string, 
}

export interface IRolePermissionModel extends IRolePermission, Document { }

const IRolePermissionSchema: Schema = new Schema(
    {
        permissionId: {type: String, required: true},
        roleId: {type: String, required: true},
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IRolePermissionModel>('RolePermission', IRolePermissionSchema);

