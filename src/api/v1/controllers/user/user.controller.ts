import { NextFunction, Request, Response } from "express";
import { UserService } from "../../services/user.service";
import { AccountNotFoundError, PasswordFormatError, WrongPasswordError } from "../../../../shared/error/auth.error";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { uploadImageFromFormData } from "../../services/firebase.service";
import User, { IUser } from "../../repository/user/user.entity";
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
        // try {
        //     const user = req.body;
        //     if (!user) {
        //         res.status(400).json({ message: 'Invalid request body' });
        //         return;
        //     }
        //     const saveUserResponse = this.userServiceInstance.save(user);
        //     res.status(201).json(saveUserResponse);
        // } catch (error) {
        //     console.error('Error:', error);
        //     res.status(500).json({ message: 'Error' });
        // }
    }

    getAll = (req: Request, res: Response, next: NextFunction) => {
        // const saveUserResponse = this.userServiceInstance.save(1);
        // return res.status(200).json(saveUserResponse);
    }


    // updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         // Lấy thông tin mới từ request body hoặc bất kỳ nguồn nào khác
    //         const newUser: any = {
    //             id: req.user.id,
    //             username: req.body.username,
    //             email: req.body.email,
    //             fullname: req.body.fullname,
    //             password: req.body.password,
    //             phone: req.body.phone,
    //         };
    //         console.log("new pass: " + newUser.password);
    //         // Kiểm tra xem request có chứa avatar không
    //         if (req.file) {
    //             // Lưu ảnh từ form data và nhận liên kết ảnh
    //             const uploadedFile = req.file;
    //             const remoteFileName = `avatars/${req.user.id}/${uploadedFile.originalname}`;
    //             const imageUrl = await uploadImageFromFormData(uploadedFile, remoteFileName);

    //             // Lưu liên kết ảnh vào newUser.avatar
    //             newUser.avatar = imageUrl;
    //         }

    //         // Gọi hàm updateUserProfile để cập nhật thông tin người dùng
    //         const updatedUser = await this.userServiceInstance.updateUserProfile(newUser);

    //         // Kiểm tra xem hàm updateUserProfile có trả về một user đã được cập nhật không
    //         if (updatedUser) {
    //             // Trả về phản hồi thành công nếu cập nhật thành công
    //             return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    //         } else {
    //             // Trả về phản hồi nếu không có thông tin nào thay đổi
    //             return res.status(200).json({ message: 'No changes to update' });
    //         }
    //     } catch (error) {
    //         if (error instanceof AccountNotFoundError) {
    //             return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Account not found', null))
    //         }
    //         console.error('Error:', error);
    //         return res.status(500).json({ message: 'Internal server error' });
    //     }
    // };

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
                {
                    const uploadedImages = req.files; // Mảng các tệp đã tải lên
                    if (uploadedImages && uploadedImages.length > 0) {
                        const imageUrls = [];
                        for (const uploadedImage of uploadedImages) {
                            const remoteFileName = `avatars/${req.user.userId}/${uploadedImage.originalname}`;
                            const imageUrl = await uploadImageFromFormData(uploadedImage, remoteFileName);
                            imageUrls.push(imageUrl);
                        }
                        const orgVerifyResult = await this.userServiceInstance.verifyOrganization(req.query.orgId, imageUrls);
                        if(orgVerifyResult)
                        {
                            return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Upload image to verify success', orgVerifyResult));
                        }
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

}


