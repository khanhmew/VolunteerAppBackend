import { NextFunction, Request, Response } from "express";
import { UserService } from "../../services/user.service";
import { AccountNotFoundError, AccountTypeNotAdmin, AccountTypeNotOrg, PasswordFormatError, WrongPasswordError } from "../../../../shared/error/auth.error";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { uploadImageFromFormData } from "../../services/firebase.service";
import Follow from '../../repository/follow/follow.entity';
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

    constructor() {
        this.userServiceInstance = new UserService();
    }

    saveUserCallback = (req: Request, res: Response, next: NextFunction): void => {
    }

    getAll = (req: Request, res: Response, next: NextFunction) => {
        // const saveUserResponse = this.userServiceInstance.save(1);
        // return res.status(200).json(saveUserResponse);
    }


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

    activeOrganiztion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const adminId = req.user.userId;
            const orgForActive: any = req.query.orgId;
            const activeResult = await this.userServiceInstance.activeOrganization(adminId, orgForActive);
            if (activeResult) {
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Organization is active', null));
            }
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Organization fail to active', null));
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
    followUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const followerId = req.user.userId; 
            const followingId = req.body.followingId; 

            const followResult = await this.userServiceInstance.followOrg(followerId, followingId);
            if(followResult.success){
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, followResult.success, {totalFollow: followResult.followersCount}));
            }
            else{
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
            if(unFollowResult.success){
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, unFollowResult.success,  {totalFollow: unFollowResult.followersCount}));
            }
            else{
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, unFollowResult.error, null));
            }
        } catch (error: any) {
            console.error('Lỗi khi bỏ theo dõi người dùng:', error);
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
        }
    };

}


