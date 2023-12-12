export interface UserAdmin {
    _id: string;
    type: string;
    fullname: string;
    avatar: string;
    email: string;
    username: string;
    phone: string;
    address: any;
    sex: any;
    imageAuthenticate?: any;
    isActiveOrganization?: boolean;
    isFollow?: boolean;
    follower?: number;
    groupPermission?: any;
    isEnable: boolean
}
