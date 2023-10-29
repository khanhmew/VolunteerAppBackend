import { NextFunction, Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { uploadImageFromFormData } from "../../services/firebase.service";
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../../shared/error/post.error";

declare global {
  namespace Express {
    interface Request {
      files?: any
    }
  }
}
export class PostController {
  postServiceInstance!: PostService;

  constructor() {
    this.postServiceInstance = new PostService();
  }

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newPost: any = {
        ownerId: req.user.userId,
        exprirationDate: req.body.exprirationDate,
        scope: req.body.scope,
        content: req.body.content,
        participants: req.body.participants
      }
      const uploadedImages = req.files; // Mảng các tệp đã tải lên
      if (uploadedImages && uploadedImages.length > 0) {
        const imageUrls = [];
        for (const uploadedImage of uploadedImages) {
          const remoteFileName = `post/${req.user.userId}/${uploadedImage.originalname}`;
          const imageUrl = await uploadImageFromFormData(uploadedImage, remoteFileName);
          imageUrls.push(imageUrl);
        }
        newPost.media = imageUrls;
        const postResultForCreate = await this.postServiceInstance.savePost(newPost);
        if (postResultForCreate) {
          return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Upload post success', postResultForCreate));
        }
        else {
          return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Upload post fail', null));
        }
      }
    } catch (error) {
      if (error instanceof PostMustCreateByOrg) {
        return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Post must create by Org', null));
      }
      else if (error instanceof ExpirationDateMustGreaterCurrentDate) {
        return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Expiration Date Must Greater Current Date', null));
      }
      else if (error instanceof DateFormat) {
        return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Date Format', null));
      }
      else if (error instanceof ParticipantsMustGreaterThan0) {
        return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Participants Must Greater Than 0', null));
      }
      else if (error instanceof OrgNotActive) {
        return res.status(404).json(ResponseBase(ResponseStatus.ERROR, 'Org not active', null));
      }
    }
  }
  getAllPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;      
      const posts = await this.postServiceInstance.getAllPost(page, limit);
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', posts));
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
    }
  }
}
