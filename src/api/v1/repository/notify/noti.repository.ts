import Notify from '../notify/notify.entity';
import Post from '../post/post.entity';
const moment = require('moment');
const { point, distance } = require('@turf/turf');
import { NotiDTO } from '../../DTO/noti.dto';
import { UserRepository } from '../user/user.repository';
import { ActivityRepository } from '../activity/activity.repository'

export class NotiRepository {
    private readonly userRepository!: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }
    createNoti = async (noti: any) => {
        const newNoti = new Notify({
            postId: noti.postId,
            senderId: noti.senderId,
            receiveId: noti.receiveId,
            message: noti.message,
            createAt: new Date(),
            actionLink: noti.actionLink,
            messageType: noti.messageType,
            status: noti.status,
            isSeen: false,
            activityId: noti.activityId
        })
        await newNoti.save();
        return newNoti;
    }

    findPostBaseActId = async (_activityId: any) => {
        try {
          const post = await Post.findOne({ activityId: _activityId });
          if (!post) {
            return ({ error: 'Post not found' })
          }
          return post;
        } catch (error) {
          console.error('Error:', error);
        }
      };

    getAllNoti = async (userId: any, page: any, limit: any) => {
        try {
          const skipCount = (page - 1) * limit;
      
          const allNoti = await Notify.find({ receiveId: userId })
            .sort({ createdAt: -1 }) 
            .skip(skipCount)
            .limit(limit);
      
          const allNotiResult = await Promise.all(
            allNoti.map(async (noti) => {
              try {
                const senderInfo = await this.userRepository.getExistUserById(noti.senderId);
                const notiInfor: NotiDTO = {
                  _id: noti._id,
                  type: noti.messageType,
                  senderId: noti.senderId,
                  receiveId: noti.receiveId,
                  postId: noti.postId || '',
                  activityId: noti.activityId || '',
                  senderAvt: senderInfo?.avatar,
                  senderFullname: senderInfo?.fullname,
                };
      
                if (noti.messageType === 'comment') {
                  notiInfor.message = `${senderInfo?.fullname} đã comment bài viết của bạn.`;
                } else if (noti.messageType === 'join') {
                  notiInfor.message = `${senderInfo?.fullname} ${noti.message}`;
                  const post: any = await this.findPostBaseActId(noti.activityId);
                  notiInfor.postId = post._id;
                }
                else if (noti.messageType === 'block') {
                  notiInfor.message = noti.message;
                }
                return notiInfor;
              } catch (error) {
                console.error('Error fetching sender info:', error);
                return null;
              }
            })
          );
      
          const filteredNotiResult = allNotiResult.filter((noti) => noti !== null);
      
          return filteredNotiResult;
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      
}   