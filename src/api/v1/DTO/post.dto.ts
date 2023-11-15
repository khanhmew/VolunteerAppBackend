export interface PostDTO {
    _id: string;
    type: string;
    ownerId: string;
    ownerDisplayname: string;
    ownerAvatar: string;
    address: string;
    updatedAt: Date;
    createdAt: Date;
    exprirationDate?: Date;
    scope: string;
    content: string;
    media: string[];
    activityId: string;
    numOfComment: number;
    commentUrl: string;
    participants: number;
    totalUserJoin: number;
    likes?: string[];
    totalLikes?: number;
    isJoin?: boolean;
    isFollow?: boolean;
    isExprired: boolean;
    dateActivity?: Date
}
