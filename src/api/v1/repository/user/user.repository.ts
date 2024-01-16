import mongoose from 'mongoose';
import User, { IUser } from './user.entity';
import Report from './report.entity';
import { AccountNotFoundError, AccountTypeNotAdmin, AccountTypeNotOrg, WrongPasswordError } from '../../../../shared/error/auth.error';
import { uploadImageFromFormData } from '../../services/firebase.service';
import { OrgActiveBefore } from '../../../../shared/error/auth.error';
import { PermissionRepository } from '../auth/permission.repository';
import { UserDTO } from '../../DTO/user.dto'
import { OrgDTO } from '../../DTO/org.dto';
import { ReportDTO } from '../../DTO/report.dto';
const bcrypt = require('bcrypt');

export class UserRepository {
    private readonly permissionRepository!: PermissionRepository;
    constructor() {
        this.permissionRepository = new PermissionRepository();
    }
    saveUser = async (_user: IUser) => {
        // const hashedPassword = await bcrypt.hash(_user.password, 10);

        // const userToStore = new User({
        //     _id: new mongoose.Types.ObjectId(),
        //     fullname: _user.fullname,
        //     avatar: _user.avatar,
        //     email: _user.email,
        //     username: _user.username,
        //     password: hashedPassword,
        //     initTime: new Date()
        // });
        // return userToStore.save();
    }

    async getUserType(userId: string): Promise<string | null> {
        try {
            const user = await User.findById(userId);
            if (user) {
                return user.roleId == '656c9bda38d3d6f36ecc8eb6' ? user.roleId : null;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting user type:', error);
            return null;
        }
    }


    checkUserExist = async (_userId: any) => {
        const result = await User.exists({ _id: _userId });
        if (result)
            return true;
        return false;
    }

    getUserByUsername = (_username: string) => {
        return User.findOne({
            username: _username
        }).select(['fullname', 'password', 'avatar', 'email']);
    }

    getExistUserByUsername = (_username: string) => {
        return User.findOne({
            username: _username
        }).select(['username']);
    }

    getExistUserById = async (_idUser: any) => {
        try {
            const user = await User.findOne({
                _id: _idUser
            }).select(['_id', 'phone', 'fullname', 'password', 'avatar', 'email', 'username', 'address']);
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }


    getExistOrgById = async (_idUser: String) => {
        try {
            const user = await User.findOne({
                _id: _idUser
            }).select(['_id', 'type', 'phone', 'fullname', 'password', 'avatar', 'email', 'address', 'username', 'isActiveOrganization', 'imageAuthenticate', 'roleId']);
            return user;
        } catch (error) {
            console.error('Error getting org by ID:', error);
            throw error;
        }
    }

    updateUserProfile = async (oldUserId: any, newUser: any) => {
        const oldUser: any = await this.getExistUserById(oldUserId);
        const changes: Partial<IUser> = {};

        if (newUser.username !== oldUser.username && newUser.username !== null && newUser.username != '') {
            changes.username = newUser.username;
        }
        if (newUser.email !== oldUser.email && newUser.email !== null && newUser.email != '') {
            changes.email = newUser.email;
        }
        if (newUser.fullname !== oldUser.fullname && newUser.fullname !== null && newUser.fullname != '') {
            changes.fullname = newUser.fullname;
        }
        if (newUser.avatar !== oldUser.avatar && newUser.avatar !== null && newUser.avatar != '') {
            changes.avatar = newUser.avatar;
        }
        if (newUser.oldPassword && newUser.oldPassword) {
            const passMatchWithOldPass = await bcrypt.compare(newUser.oldPassword, oldUser.password);
            console.log("Old user: " + oldUser);
            console.log("old pass " + newUser.oldPassword + " True or false: " + passMatchWithOldPass);
            if (passMatchWithOldPass) {
                if (newUser.password !== null && newUser.password !== '') {
                    if (oldUser.password && newUser.password) {
                        const passwordMatch = await bcrypt.compare(oldUser.password, newUser.password);
                        if (passwordMatch === false) {
                            const hashedPassword = await bcrypt.hash(newUser.password, 10);
                            changes.password = hashedPassword;
                        }
                    }
                }
            }
            if (!passMatchWithOldPass) {
                throw new WrongPasswordError('Password not match');
            }
        }

        if (newUser.address !== oldUser.address) {
            changes.address = newUser.address;
        }

        if (newUser.phone !== oldUser.phone) {
            changes.phone = newUser.phone;
        }

        if (newUser.address !== oldUser.address) {
            changes.address = newUser.address;
        }

        if (Object.keys(changes).length > 0) {
            try {
                const updatedUser = await User.findByIdAndUpdate(
                    oldUser._id, // ID của người dùng cần cập nhật
                    changes, // Dữ liệu cần cập nhật
                    { new: true } // Tùy chọn để trả về người dùng đã cập nhật
                );
                const userResultForUpdate: any = {
                    _id: updatedUser?.id,
                    type: updatedUser?.type,
                    fullname: updatedUser?.fullname,
                    username: updatedUser?.username,
                    phone: updatedUser?.phone,
                    avatar: updatedUser?.avatar,
                    email: updatedUser?.email,
                    address: updatedUser?.address,

                };
                if (updatedUser?.roleId == '656c9bda38d3d6f36ecc8eb6') {
                    userResultForUpdate.isActive = updatedUser?.isActiveOrganization;
                    userResultForUpdate.type = 'Organization'
                }
                else {
                    userResultForUpdate.type = 'User'
                }
                return { userResultForUpdate };
            } catch (error) {
                console.error('Error updating user:', error);
                throw error;
            }
        } else {
            return null;
        }
    };



    // editOrganizationProfile = (_organization: IUser) => {
    //     return 
    // }

    verifyOrganization = async (_orgId: String, _images: String[]) => {
        try {
            const orgForVerify: any = await this.getExistOrgById(_orgId);
            console.log('orgForVerify: ' + orgForVerify);
            if (!orgForVerify) {
                throw new AccountNotFoundError('Organization not found');
            }
            if (orgForVerify.imageAuthenticate.length === 0) {
                orgForVerify.imageAuthenticate = [];
            }
            console.log('before: ' + orgForVerify.imageAuthenticate.length)
            orgForVerify.imageAuthenticate.push(..._images);
            const updatedOrg = await orgForVerify.save();
            return updatedOrg;
        } catch (error) {
            console.error('Error verifying organization:', error);
            throw error;
        }
    }

    activeOrg = async (_orgId: String) => {
        try {
            const orgForUpdate = await User.findOneAndUpdate({ _id: _orgId },
                { $set: { isActiveOrganization: true } },
                { new: true });
            return { success: 'ban success', org: orgForUpdate }
        } catch (error) {
            return { error: error }
        }
    }


    //#region ADMIN
    getAllUsers = async (page: any, limit: any) => {
        try {
            const skip = (page - 1) * limit;

            const users = await User.find()
                .sort({ initTime: -1 })
                .skip(skip)
                .limit(limit);
            const usersResult: UserDTO[] = await Promise.all(users.map(async (user) => {
                const typeUser = await this.permissionRepository.getTitleRole(user.roleId);

                if (typeUser?.toLocaleLowerCase() === 'organization') {
                    return {
                        _id: user._id,
                        address: user.address,
                        email: user.email,
                        avatar: user.avatar,
                        fullname: user.fullname,
                        phone: user.phone,
                        sex: user.sex,
                        username: user.username,
                        type: 'Organization',
                        isEnable: user.isEnable
                    };
                } else if (typeUser?.toLocaleLowerCase() === 'admin') {
                    return {
                        _id: user._id,
                        address: user.address,
                        email: user.email,
                        avatar: user.avatar,
                        fullname: user.fullname,
                        phone: user.phone,
                        sex: user.sex,
                        username: user.username,
                        type: 'Admin', // You might want to set a default type for non-organization users
                        isEnable: user.isEnable
                    };
                }
                else if (typeUser?.toLocaleLowerCase() === 'super admin') {
                    return {
                        _id: user._id,
                        address: user.address,
                        email: user.email,
                        avatar: user.avatar,
                        fullname: user.fullname,
                        phone: user.phone,
                        sex: user.sex,
                        username: user.username,
                        type: 'Super Admin', // You might want to set a default type for non-organization users
                        isEnable: user.isEnable
                    };
                }
                else {
                    return {
                        _id: user._id,
                        address: user.address,
                        email: user.email,
                        avatar: user.avatar,
                        fullname: user.fullname,
                        phone: user.phone,
                        sex: user.sex,
                        username: user.username,
                        type: 'User', // You might want to set a default type for non-organization users
                        isEnable: user.isEnable
                    };
                }
            }));

            return usersResult;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    };



    //ban user 
    banUser = async (userIdForBan: String) => {
        try {
            const userForUpdate = await User.findOneAndUpdate({ _id: userIdForBan },
                { $set: { isEnable: false } },
                { new: true });
            return { success: 'ban success', user: userForUpdate }
        } catch (error) {
            return { error: error }
        }
    }


    //get all org send authentication 
    getAllOrgAuthen = async (page: any, limit: any) => {
        try {
            const skip = (page - 1) * limit;

            const allOrgs = await User.find({
                isActiveOrganization: false,
                isEnable: true,
                roleId: '656c9bda38d3d6f36ecc8eb6',
                imageAuthenticate: { $exists: true, $not: { $size: 0 } } // Check if the imageAuthenticate array is not empty
            })
                .sort({ initTime: -1 })
                .skip(skip)
                .limit(limit);

            return { success: 'get success', orgs: allOrgs };
        } catch (error) {
            console.error('Error getting authenticated organizations:', error);
            return { error: error };
        }
    };

    getDetailOrg = async (orgId: any) => {
        try {
            const orgFind: any = await User.findById({ _id: orgId });
            if (orgFind) {
                const orgDetail: OrgDTO = {
                    _id: orgId,
                    address: orgFind.address,
                    avatar: orgFind.avatar,
                    email: orgFind.email,
                    fullname: orgFind.fullname,
                    imageAuthenticate: orgFind.imageAuthenticate,
                    isActiveOrganization: orgFind.isActiveOrganization,
                    isEnable: orgFind.isEnable,
                    phone: orgFind.phone,
                    sex: orgFind.sex,
                    type: 'Organization',
                    username: orgFind.username,
                }
                return { success: 'get success', org: orgDetail };
            }
            return { eror: 'get fail' }
        } catch (error) {
            return { eror: error }
        }
    }

    //#endregion ADMIN



    //region REPORT 
    async sendReport(report: any) {
        try {
            // Validate input parameters
            if (!report || !report.userId || !report.orgId || !report.content) {
                throw new Error('Invalid report data. Missing required fields.');
            }

            const newReport = new Report({
                userSendId: report.userId,
                orgReport: report.orgId,
                content: report.content,
                image: report.img
            });

            const resultReport = await newReport.save();

            const response = {
                message: 'Report submitted successfully',
                report: resultReport,
            };

            return response;
        } catch (error) {
            console.error('Error sending report:', error);
            return error
        }
    }


    async solveReport(reportId: any) {
        try {
            const reportForSolve = await Report.findOneAndUpdate({ _id: reportId }, { $set: { isSolved: true } })
            return reportForSolve;
        } catch (error) {
            console.log(`err: ${error}`)
        }
    }

    async getAllReportByType(solved: any) {
        if (solved == true) {
            const allReport = Report.find({
                isSolved: true
            })
            return allReport
        }
        else if (solved == false) {
            const allReport = Report.find({
                isSolved: false
            })
            return allReport
        }
        const allReport = Report.find()
        return allReport
    }
    async getAllReport(solved: any) {
        try {
            const allReport = await this.getAllReportByType(solved);
            const reportsInformation = await Promise.all(allReport.map(async (report) => {
                try {
                    const orgInfo = await this.getExistOrgById(report.orgReport);
                    const userInfo = await this.getExistUserById(report.userSendId);
                    const reportResult: ReportDTO = {
                        _id: report._id,
                        content: report.content,
                        img: report.image,
                        orgAvt: orgInfo?.avatar,
                        orgFullname: orgInfo?.fullname,
                        orgId: report.orgReport,
                        userSendId: report.userSendId,
                        userSendAvatar: userInfo?.avatar,
                        userSendFullname: userInfo?.fullname,
                        userSendPhone: userInfo?.phone,
                        dateReport: report.sendDate
                    };
                    return reportResult;
                } catch (error) {
                    console.error(`Error processing report ${report._id}:`, error);
                    return null;
                }
            }));

            const filteredReports = reportsInformation.filter(report => report !== null);

            return filteredReports;
        } catch (error) {
            console.error('Error in getAllReport:', error);
            throw error;
        }
    }

    //endregion REPORT


    //#region SEARCH
    async searchUser(text: string) {
        const result = User.aggregate([
            {
                $search: {
                    index: "search_user",
                    text: {
                        query: text,
                        path: {
                            wildcard: "*"
                        }
                    }
                }
            }
        ])
        console.log(`RESULT SEARCH: `, result);
        return result;
    }

    //endregion SEARCH
}