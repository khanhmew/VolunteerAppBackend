export interface NotiDTO {
    _id: String;
    type: String,
    senderId: String, 
    receiveId: String, 
    postId?: String,
    activityId?: String,
    senderFullname?: String,
    senderAvt?: String,
    message?: String,
}
