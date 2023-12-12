import Permission from './permission.entity';
import RolePermission from './rolePermission.entity';
import Role from './role.entity';
import User, { IUser } from '../user/user.entity';

export class PermissionRepository {
    async getPermissionARole(_roleID: any) {
        const permissionOfRole = await RolePermission.find({ roleId: _roleID });

        const allPermissionName = await Promise.all(permissionOfRole.map(async (rolePermission) => {
            const permission = await Permission.findById(rolePermission.permissionId).exec();
            return permission?.title;
        }));

        return allPermissionName;
    }


    async createNewPermission(_roleId: any, _permissionId: any) {
        const newPer = new RolePermission({
            roleId: _roleId,
            permissionId: _permissionId
        })
        newPer.save();
        return newPer;
    }

    async getTitleRole(_roleID: any){
        const roleForGet =await Role.findById(_roleID).exec();
        return roleForGet?.title;
    }

    async getRoleID(_roleName: any){
        const roleForGet =await Role.findOne({title: _roleName});
        return roleForGet;
    }

    async hasPermission(userId: any, permissionName: string): Promise<boolean> {
        try {
            const user = await User.findOne({ _id: userId }).exec();
            // Find the role's permissions
            const rolePermissions = await RolePermission.find({ roleId: user?.roleId}).exec();
    
            // Check if the desired permission exists for the role
            const hasPermission = await Promise.all(
                rolePermissions.map(async (rolePermission) => {
                    const permission = await Permission.findById(rolePermission.permissionId).exec();
                    return permission?.title === permissionName;
                })
            );
    
            // Return true if the role has the permission, otherwise false
            return hasPermission.some((permission) => permission);
        } catch (error) {
            console.error('Error checking role permission:', error);
            throw error;
        }
    }
    
}