export interface commentDTO {
    _id: String;
    postId: string, 
    ownerId: string, 
    parentId?: String,
    createAt: Date,
    ownerDisplayname?: string,
    ownerAvatar?: string,
    content: string
}
