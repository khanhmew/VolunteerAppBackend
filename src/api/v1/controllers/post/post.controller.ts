import { NextFunction, Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { getImageSize, uploadImageFromFormData } from "../../services/firebase.service";
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
        type: req.body.type,
        exprirationDate: req.body.exprirationDate,
        scope: req.body.scope,
        content: req.body.content,
        participants: req.body.participants,
        dateActivity: req.body.dateActivity
      }
      const uploadedImages = req.files; // Mảng các tệp đã tải lên
      if (uploadedImages && uploadedImages.length > 0) {
        const imageUrls = [];
        for (const uploadedImage of uploadedImages) {
          const remoteFileName = `post/${req.user.userId}/${uploadedImage.originalname}`;

          // Log kích thước hình ảnh gốc
          console.log(`Image size before processing: ${uploadedImage.size} bytes`);

          const imageUrl = await uploadImageFromFormData(uploadedImage, remoteFileName);

          // Log kích thước hình ảnh sau khi xử lý
          console.log(`Image size after processing: ${imageUrl ? await getImageSize(imageUrl) : 'N/A'}`);

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
      var userIdForCheckJoin = '';
      if (req.user) {
        userIdForCheckJoin = req.user.userId;
      }
      const posts = await this.postServiceInstance.getAllPost(page, limit, userIdForCheckJoin);
      if (posts.posts.length < 1) {
        return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Out of post', null));
      }
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', posts));
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
    }
  }
  getAllPostUserFollow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      var userIdForCheckJoin = '';
      if (req.user) {
        userIdForCheckJoin = req.user.userId;
      }
      const posts: any = await this.postServiceInstance.getAllPostUserFollow(page, limit, userIdForCheckJoin);
      if (posts.postsInformation.length < 1) {
        console.log('Out of post')
        return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Out of post', null));
      }
      if (posts.error) {
        console.log(posts.error)
        return res.status(400).json(ResponseBase(ResponseStatus.ERROR, posts.error, null));
      }
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', posts));
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
    }
  }
  getAllPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.orgId;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      var userIdForCheckJoin = '';
      if (req.user) {
        userIdForCheckJoin = req.user.userId;
      }
      const posts = await this.postServiceInstance.getAllPostByOrg(userIdForCheckJoin, postId, page, limit);
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', posts));
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
    }
  }

  getDetailPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postIdForGet = req.params.postId;
      var userIdForCheckJoin = '';
      if (req.user) {
        userIdForCheckJoin = req.user.userId;
      }
      const postDetail = await this.postServiceInstance.getDetaiPost(postIdForGet, userIdForCheckJoin);
      res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', postDetail));
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
    }
  }
  getPostsNearest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'User must login', null));
      }
      const userForGetId = req.user.userId;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const postsGet: any = await this.postServiceInstance.getNearbyPosts(userForGetId, page, limit);
      if (postsGet.length < 1) {
        return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Out of post', null));
      }
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', postsGet));
    } catch (error: any) {
      return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
    }
  }

  getAllTopOrgCreatePost = async (req: Request, res: Response, next: NextFunction) => {
    const topUsers: any = await this.postServiceInstance.getOrgCreateMostPost();
    if (topUsers)
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', topUsers))
    return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
  }

  getAllTopPostUserJoinMost = async (req: Request, res: Response, next: NextFunction) => {
    const topPosts: any = await this.postServiceInstance.getTopPostUserJoin();
    if (topPosts)
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', topPosts))
    return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
  }

  //#region COMMENT
  commentAPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'User must login', null));
      }
      const userForCommentId = req.user.userId;
      const postIdForComment = req.body.postId;
      const contentForComment = req.body.content;
      const parentId = req.body.parentId;

      if (contentForComment == '')
        return res.status(400).json(ResponseBase(ResponseStatus.SUCCESS, 'Comment not allowed blank', null))
      if (parentId) {
        const resultCommentReply: any = await this.postServiceInstance.replyAComment(userForCommentId, postIdForComment, contentForComment, parentId);
        if (resultCommentReply.success) {
          return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, resultCommentReply.success, resultCommentReply.comment))
        }
        return res.status(400).json(ResponseBase(ResponseStatus.SUCCESS, resultCommentReply.error, null))
      }
      const resultComment: any = await this.postServiceInstance.commentAPost(userForCommentId, postIdForComment, contentForComment);
      if (resultComment.success) {
        return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, resultComment.success, resultComment.comment))
      }
      return res.status(400).json(ResponseBase(ResponseStatus.SUCCESS, resultComment.error, null))
    } catch (error: any) {
      return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
    }
  }

  getAllComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const postIdForGet = req.params.postId;
      const comments = await this.postServiceInstance.getAllCommentAPost(postIdForGet, page, limit);
      if (comments.length < 1) {
        return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Out of comment', null));
      }
      return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', comments));
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', null));
    }
  }
  //#endregion COMMENT


  //search post
  searchPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryText = req.query.text;
      const resultSearch = await this.postServiceInstance.searchPost(queryText);
      if (resultSearch)
        return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'search success', resultSearch));
      return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'not post found', null));
    } catch (error: any) {
      return res.status(500).json(ResponseBase(ResponseStatus.ERROR, error, null));
    }
  }

}
