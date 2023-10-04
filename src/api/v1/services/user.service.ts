import { AccountNotFoundError } from "../../../shared/error/auth.error";
import {
  ResponseBase,
  ResponseStatus,
} from "../../../shared/response/response.payload";
import { UserDomainModel } from "../model/user.domain.model";
import { IUser } from "../repository/user/user.entity";
import { UserRepository } from "../repository/user/user.repository";

export class UserService {
  private readonly userDomainModel!: UserDomainModel;
  private readonly userRepository!: UserRepository;

  constructor() {
    this.userDomainModel = new UserDomainModel();
    this.userRepository = new UserRepository();
  }

  async save(user: any) {
    // const username = this.userDomainModel.formatUsername(user.username);

    // const userStored = await this.userRepository.getUserByUsername(username);

    // if (userStored) {
    //   return ResponseBase(
    //     ResponseStatus.SUCCESS,
    //     "Found user by user name",
    //     userStored
    //   );
    // }
    // this.userRepository.saveUser(user);
    // return ResponseBase(
    //   ResponseStatus.NOT_FOUND,
    //   "Not found user by user name",
    //   null
    // );
  }

  async getByUsername(_username: string) {
    // try {
    //   const userStored = await this.userRepository.getUserByUsername(
    //     _username
    //   );

    //   if (userStored) {
    //     return ResponseBase(
    //       ResponseStatus.SUCCESS,
    //       "Found user by user name",
    //       userStored
    //     );
    //   }
    //   return ResponseBase(
    //     ResponseStatus.NOT_FOUND,
    //     "Not found user by user name",
    //     null
    //   );
    // } catch (error) {
    //   console.error(

    //     error
    //   );
    //   return ResponseBase(
    //     ResponseStatus.ERROR,
    //     "Error when get user",
    //     null
    //   );
    // }
  }
  async updateUserProfile(_user: any) {
    try {
      const userResultUpdate = await this.userRepository.updateUserProfile(_user.id, _user);
      return userResultUpdate;
    } catch (error: any) {
      throw error;
    }
  }

  async verifyOrganization(_orgId: any, _images: any) {
    try {
      const orgResult = await this.userRepository.verifyOrganization(_orgId, _images);
      return orgResult;
    } catch (error: any) {
      if (error instanceof AccountNotFoundError) {
        throw new AccountNotFoundError('Organization not found');
      }
    }
  }

  async activeOrganization(_adminId: String, _orgId: String) {
    try {
      const activeResult = await this.userRepository.activeOrg(_adminId, _orgId);
      return activeResult;
    } catch (error: any) {
      if (error instanceof AccountNotFoundError) {
        throw new AccountNotFoundError('Organization not found');
      }
    }
  }
}
