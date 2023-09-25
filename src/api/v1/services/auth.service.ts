import {
  ResponseBase,
  ResponseStatus,
} from "../../../shared/response/response.payload";
import { UserDomainModel } from "../model/user.domain.model";
import { AuthRepository } from "../repository/auth/auth.repository";
import { UserRepository } from "../repository/user/user.repository";
import {
  AccountNotFoundError,
  WrongPasswordError,
  EmailFormatError,
  PasswordFormatError,
  UsernameExistError,
} from "../../../shared/error/auth.error";
import { validateEmail } from "../../../shared/validate/user.validate";
import {
  validatePassword,
  validateUsername,
} from "../../../shared/validate/user.validate";
import { AnyKeys } from "mongoose";

export class AuthService {
  private readonly userDomainModel!: UserDomainModel;
  private readonly authRepository!: AuthRepository;
  private readonly userRepository!: UserRepository;

  constructor() {
    this.userDomainModel = new UserDomainModel();
    this.authRepository = new AuthRepository();
    this.userRepository = new UserRepository();
  }

  async authenticate(_username: String, _password: String) {
    try {
      const authResult = await this.authRepository.authenticate(
        _username,
        _password
      );
      if (authResult.userResult)
        return authResult;
    } catch (error) {
      if (error instanceof AccountNotFoundError) {
        throw new AccountNotFoundError('Account not found');
      } else if (error instanceof WrongPasswordError) {
        throw new WrongPasswordError('Wrong password');
      } else {
        console.error("Error: ", error);
        throw error;
      }
    }
  }

  async register(user: any) {
    const validateEmailResult = validateEmail(user.email);
    const validatePassResult = validatePassword(user.password);
    const userHasUsernameExist =await this.authRepository.findExistByUsername(
      user.username
    );
    try {
      console.log(userHasUsernameExist);
      if (!validateEmailResult) {
        throw new EmailFormatError('Email format error');
      }
      if (!validatePassResult) {
        throw new PasswordFormatError("Password must contain a upcase alphabet and a number");
      }
      if (userHasUsernameExist != null) {
        throw new UsernameExistError("Username exist");
      }
      this.authRepository.register(user);
      return user;
    } catch (error: any) {
      if (error.message.includes('duplicate key error')) {
        throw new UsernameExistError("Username exist");
      } else {
        console.error("Error: ", error);
        throw error;
      }
    }
  }
}
