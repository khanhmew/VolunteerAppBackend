import { NextFunction, Request, Response } from "express";
import { UserService } from "../../services/user.service";
import { AccountNotFoundError, AccountTypeNotAdmin, AccountTypeNotOrg, PasswordFormatError, WrongPasswordError } from "../../../../shared/error/auth.error";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { getImageSize, uploadImageFromFormData } from "../../services/firebase.service";
import Follow from '../../repository/follow/follow.entity';
import { PermissionRepository } from "../../repository/auth/permission.repository";
const bcrypt = require('bcrypt');

declare global {
    namespace Express {
        interface Request {
            file?: any;
            user?: any;
            files?: any
        }
    }
}
export class UserController {
    userServiceInstance!: UserService;
    permissionRespository !: PermissionRepository;
    constructor() {
        this.userServiceInstance = new UserService();
        this.permissionRespository = new PermissionRepository();
    }

    saveUserCallback = (req: Request, res: Response, next: NextFunction): void => {
    }

    getAll = (req: Request, res: Response, next: NextFunction) => {
        // const saveUserResponse = this.userServiceInstance.save(1);
        // return res.status(200).json(saveUserResponse);
    }

    //#region  ADMIN
    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const userId = req.user.userId
            const checkRole = await this.permissionRespository.hasPermission(userId, 'VIEW ACCOUNT')
            if (checkRole) {
                const users = await this.userServiceInstance.getAllUsers(page, limit);
                if (users.length < 1) {
                    return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Out of user', null));
                }
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', users));
            }
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Access denied', null));
        } catch (error) {
            console.error('Error getting users:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
        }
    }


    //ban user
    banUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.userId
            const userIdForBan = req.params.userid
            const checkRole = await this.permissionRespository.hasPermission(userId, 'BAN ACCOUNT')
            if (checkRole) {
                const users = await this.userServiceInstance.banUsers(userIdForBan);
                if (users.error) {
                    return res.status(400).json(ResponseBase(ResponseStatus.ERROR, users.error, null));
                }
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Ban success', users.user));
            }
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Access denied', null));
        } catch (error) {
            console.error('Error getting users:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Ban fail', null));
        }
    }


    //solveReport
    solveReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.userId
            const reportId = req.body.reportId
            const checkRole = await this.permissionRespository.hasPermission(userId, 'REPORT')
            if (checkRole) {
                const users = await this.userServiceInstance.solveReport(reportId);
                if (users)
                    return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Solved success', users.user));
            }
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Access denied', null));
        } catch (error) {
            console.error('Error getting users:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Solved fail', null));
        }
    }

    getAllReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.userId
            const solve = req.body.solve
            const checkRole = await this.permissionRespository.hasPermission(userId, 'REPORT')
            if (checkRole) {
                const reports = await this.userServiceInstance.getAllReport(solve);
                if (reports)
                    return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', reports));
            }
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Access denied', null));
        } catch (error) {
            console.error('Error getting users:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
        }
    }

    activeOrganiztion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const adminId = req.user.userId;
            const orgForActive: any = req.params.orgid;
            const checkRole = await this.permissionRespository.hasPermission(adminId, 'VERIFY')
            if (checkRole) {
                const activeResult: any = await this.userServiceInstance.activeOrganization(orgForActive);
                if (activeResult.error) {
                    return res.status(400).json(ResponseBase(ResponseStatus.ERROR, activeResult.error, null));
                }
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Verify success', activeResult.org));
            }
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Access denied', null));
        } catch (error) {
            if (error instanceof AccountNotFoundError) {
                return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Organization not found', null));
            } else if (error instanceof AccountTypeNotAdmin) {
                return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'You must be admin to active this org', null));
            } else if (error instanceof AccountTypeNotOrg) {
                return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'This account is not org', null));
            }
        }
    }

    getAllOrgSendVerify = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const userId = req.user.userId
            const checkRole = await this.permissionRespository.hasPermission(userId, 'VERIFY')
            if (checkRole) {
                const allOrgs = await this.userServiceInstance.getAllOrgAuthen(page, limit);
                if (allOrgs.error) {
                    return res.status(400).json(ResponseBase(ResponseStatus.ERROR, allOrgs.error, null));
                }
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', allOrgs.orgs));
            }
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Access denied', null));
        } catch (error) {
            console.error('Error getting users:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
        }
    }

    //detail org 
    getDetailOrg = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.userId
            const orgIdForGet = req.params.orgid
            const checkRole = await this.permissionRespository.hasPermission(userId, 'VERIFY')
            if (checkRole) {
                const orgResult = await this.userServiceInstance.getDetailOrg(orgIdForGet);
                if (orgResult.error) {
                    return res.status(400).json(ResponseBase(ResponseStatus.ERROR, orgResult.error, null));
                }
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', orgResult.org));
            }
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Access denied', null));
        } catch (error) {
            console.error('Error getting org:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
        }
    }

    //#endregion ADMIN
    updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.user.userId == req.query.userid) {
                const newUser: any = {
                    id: req.user.userId,
                    username: req.body.username,
                    email: req.body.email,
                    fullname: req.body.fullname,
                    password: req.body.password,
                    phone: req.body.phone,
                    oldPassword: req.body.oldPassword,
                    address: req.body.address,
                };

                if (req.file) {
                    const uploadedFile = req.file;
                    const remoteFileName = `avatars/${req.user.userId}/${uploadedFile.originalname}`;
                    const imageUrl = await uploadImageFromFormData(uploadedFile, remoteFileName);

                    newUser.avatar = imageUrl;
                }

                if (!req.user || !req.user.userId) {
                    return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'User not found', null));
                }

                const updatedUser = await this.userServiceInstance.updateUserProfile(newUser);

                if (updatedUser) {
                    return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Profile updated successfully', updatedUser));
                } else {
                    return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'No changes to update', updatedUser));
                }
            }
            else {
                return res.status(500).json(ResponseBase(ResponseStatus.FAILURE, 'You must authenticate', null));
            }

        } catch (error) {
            if (error instanceof AccountNotFoundError) {
                return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Acccount not found', null));
            }
            if (error instanceof WrongPasswordError) {
                return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Password not match', null));
            }
            console.error('Error:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.FAILURE, 'Internal server error', null));
        }
    };


    //#endregion ADMIN

    verifyOrganiztion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('User:', JSON.stringify(req.user));
            if (req.user.userId == req.query.orgId) {
                const uploadedImages = req.files; // Mảng các tệp đã tải lên
                if (uploadedImages && uploadedImages.length > 0) {
                    const imageUrls = [];
                    for (const uploadedImage of uploadedImages) {
                        const remoteFileName = `verify/${req.user.userId}/${uploadedImage.originalname}`;
                        const imageUrl = await uploadImageFromFormData(uploadedImage, remoteFileName);
                        imageUrls.push(imageUrl);
                    }
                    const orgVerifyResult = await this.userServiceInstance.verifyOrganization(req.query.orgId, imageUrls);
                    if (orgVerifyResult) {
                        return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Upload image to verify success', orgVerifyResult));
                    }
                }
            } else {
                return res.status(500).json(ResponseBase(ResponseStatus.FAILURE, 'You must authenticate', null));
            }
        } catch (error) {
            if (error instanceof AccountNotFoundError) {
                return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Organization not found', null));
            }
        }
    }


    followUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const followerId = req.user.userId;
            const followingId = req.body.followingId;

            const followResult = await this.userServiceInstance.followOrg(followerId, followingId);
            if (followResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, followResult.success, { totalFollow: followResult.followersCount }));
            }
            else {
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, followResult.error, null));
            }
        } catch (error: any) {
            console.error('Lỗi khi theo dõi người dùng:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    };

    unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const followerId = req.user.userId;
            const followingId = req.body.followingId;
            const unFollowResult = await this.userServiceInstance.unFollowOrg(followerId, followingId);
            if (unFollowResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, unFollowResult.success, { totalFollow: unFollowResult.followersCount }));
            }
            else {
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, unFollowResult.error, null));
            }
        } catch (error: any) {
            console.error('Lỗi khi bỏ theo dõi người dùng:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    };

    countFollowOrg = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orgId = req.params.orgid;
            const countFollowResult = await this.userServiceInstance.getAllFollow(orgId);
            if (countFollowResult.success) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, countFollowResult.success, countFollowResult.follow));
            }
            else {
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, countFollowResult.error, null));
            }
        } catch (error: any) {
            console.error('Lỗi khi bỏ theo dõi người dùng:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    };

    //send report 
    sendReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newReport: any = {
                userId: req.user.userId,
                orgId: req.body.orgId,
                content: req.body.content
            }
            const uploadedImages = req.files; // Mảng các tệp đã tải lên
            if (uploadedImages && uploadedImages.length > 0) {
                const imageUrls = [];
                for (const uploadedImage of uploadedImages) {
                    const remoteFileName = `report/${req.user.userId}/${uploadedImage.originalname}`;

                    // Log kích thước hình ảnh gốc
                    console.log(`Image size before processing: ${uploadedImage.size} bytes`);

                    const imageUrl = await uploadImageFromFormData(uploadedImage, remoteFileName);

                    // Log kích thước hình ảnh sau khi xử lý
                    console.log(`Image size after processing: ${imageUrl ? await getImageSize(imageUrl) : 'N/A'}`);

                    imageUrls.push(imageUrl);
                }

                newReport.img = imageUrls;
                const reportResultForCreate = await this.userServiceInstance.sendReport(newReport);
                if (reportResultForCreate) {
                    return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Send success', reportResultForCreate));
                }
                else {
                    return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Send fail', null));
                }
            }
        } catch (error) {
            return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Send fail', null));
        }
    }

    //search user
    searchUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const queryText = req.query.text;
            const resultSearch = await this.userServiceInstance.searchUser(queryText);
            if (resultSearch)
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'search success', resultSearch));
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'not user found', null));
        } catch (error: any) {
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    }
}


