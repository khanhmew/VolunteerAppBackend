import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../services/auth.service";
import { AccountNotFoundError, EmailFormatError, PasswordFormatError, UsernameExistError, WrongPasswordError } from "../../../../shared/error/auth.error";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";

export class AuthController {
  authServiceInstance!: AuthService;

  constructor() {
    this.authServiceInstance = new AuthService();
  }

  authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { username, password } = req.body;
      const authenticateResponse = await this.authServiceInstance.authenticate(
        username,
        password
      );
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Login success', authenticateResponse));
    } catch (error) {
      if (error instanceof AccountNotFoundError) {
        return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Account not found', null))
      } else if (error instanceof WrongPasswordError) {
        return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Wrong password', null))
      } else {
        console.error("Error: ", error);
        throw error;
      }
    }
  };


  authenticateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  )  => {
    try {
      const { username, password } = req.body;
      const authenticateResponse = await this.authServiceInstance.authenticateAdmin(
        username,
        password
      );
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Login success', authenticateResponse));
    } catch (error) {
      if (error instanceof AccountNotFoundError) {
        return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Account not found', null))
      } else if (error instanceof WrongPasswordError) {
        return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Wrong password', null))
      } else {
        console.error("Error: ", error);
        throw error;
      }
    }
  };

  createNewPermission = async (req: Request, res: Response, next: NextFunction) => {
    const { roleId, permissionId } = req.body;
    await this.authServiceInstance.createNewPermission(roleId, permissionId);
  }


  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.body;
      const saveUserResponse = await this.authServiceInstance.register(user);
      console.log(saveUserResponse);
      return res.status(201).json(ResponseBase(ResponseStatus.SUCCESS, 'Sign up success', saveUserResponse));
    } catch (error) {
      if (error instanceof EmailFormatError) {
        return res.status(422).json(ResponseBase(ResponseStatus.ERROR, 'Email format error', null))
      } else if (error instanceof PasswordFormatError) {
        return res.status(422).json(ResponseBase(ResponseStatus.ERROR, 'Password format error', null))
      } else if (error instanceof UsernameExistError) {
        return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Username exist', null))
      } else {
        console.error("Error: ", error);
        throw error;
      }
    }
  };

  checkUsernameExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username: any = req.query.username;
      const usernameExitsResult = await this.authServiceInstance.checkUsernameExist(username);
      if (usernameExitsResult)
        return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Username exist', null))
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Not found user', null));
    }
    catch (error: any) {
      throw error;
    }
  }
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var userIdForCheckJoin = '';
      if (req.user) {
        userIdForCheckJoin = req.user.userId;
      }
      const orgId = req.params.orgId;
      const profileResult = await this.authServiceInstance.getProfile(orgId, userIdForCheckJoin);
      if (!profileResult)
        return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null))
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', { profileResult }));
    }
    catch (error: any) {
      throw error;
    }
  }

}
