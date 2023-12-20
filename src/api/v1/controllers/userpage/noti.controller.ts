import { NextFunction, Request, Response } from "express";
import { NotiService } from "../../services/noti.service";
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
export class NotiController {
    NotiServiceInstance!: NotiService;
    constructor() {
        this.NotiServiceInstance = new NotiService();
    }
    getAllNoti = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const page = Number(req.query.page) || 1;
          const limit = Number(req.query.limit) || 10;
          var userIdForCheckJoin = '';
          if (req.user) {
            userIdForCheckJoin = req.user.userId;
          }
          const noties: any = await this.NotiServiceInstance.getAllNoti(userIdForCheckJoin,page, limit);
          if (noties.length < 1) {
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Out of noti', null));
          }
          return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', noties));
        } catch (error) {
          console.error('Error getting noties:', error);
          return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
        }
      }
   
}


