import { NextFunction, Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { uploadImageFromFormData } from "../../services/firebase.service";
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../../shared/error/post.error";
import { PostRepository } from "../../repository/post/post.repository";
import { getTotalLikesForPost, hasUserLikedPost, saveLikeForPost, unlikeForPost } from "../../../../redis/redisUtils";
import mongoose, { isValidObjectId } from "mongoose";

export class PostRedisController {
    private readonly postRepository!: PostRepository;

    constructor() {
        this.postRepository = new PostRepository();
    }

    likeAPost = async (req: Request, res: Response, next: NextFunction) => {
        const usernameLikePost = req.user.username;
        const { postId } = req.body;
        if (!isValidObjectId(postId)) {
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Invalid postId', null));
        }
        const checkPostExist = await this.postRepository.checkPostExist(postId);
        if (!usernameLikePost)
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'You must authenticate!', null));
        if (!checkPostExist)
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Post not exist', null));
        hasUserLikedPost(postId, usernameLikePost)
            .then((result) => {
                if (result === 1) {
                    return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'User like this post before', null));
                } else {
                    saveLikeForPost(postId, usernameLikePost)
                        .then(() => {
                            return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Like success', null));
                        })
                        .catch((error: any) => {
                            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Like fail', error));
                        });
                }
            })
            .catch((error) => {
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Error when check user like post', error));
            });

    }
    getAllLikePost = async (req: Request, res: Response, next: NextFunction) => {
        const postId = req.params.postId;
        if (!isValidObjectId(postId)) {
            return res.status(400).json({ error: 'Invalid postId' });
        }
        getTotalLikesForPost(postId)
            .then((likes: any) => {
                const totalLikes = likes.length;
                const totalUserLike = { likes , totalLikes};
                return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Get success', totalUserLike));
            })
            .catch((error: any) => {
                console.error('Error like:', error);
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Get fail', error));
            });
    }
    unlikeAPost = async (req: Request, res: Response, next: NextFunction) => {
        const usernameLikePost = req.user.username;
        const { postId } = req.body;
        if (!isValidObjectId(postId)) {
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Invalid postId', null));
        }
        const checkPostExist = await this.postRepository.checkPostExist(postId);
        // console.log(checkPostExist)
        if (!usernameLikePost)
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'You must authenticate!', null));
        if (!checkPostExist)
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Post not exist', null));
        hasUserLikedPost(postId, usernameLikePost)
            .then((result) => {
                if (result === 1) {
                    unlikeForPost(postId, usernameLikePost)
                        .then(() => {
                            return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'Unlike success', null));
                        })
                        .catch((error) => {
                            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Unlike fail', error));
                        });
                } else {
                    return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'User not like this post before', null));
                }
            })
            .catch((error) => {
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Error when check user like post', null));
            });
    }

    checkUserLikePost = async (req: Request, res: Response, next: NextFunction) => {
        const usernameLikePost = req.user.username;
        const postId: any = req.params.postId;
        if (!isValidObjectId(postId)) {
            return res.status(400).json(ResponseBase(ResponseStatus.ERROR, 'Invalid postId', null));
        }
        const checkPostExist = await this.postRepository.checkPostExist(postId);
        if (!usernameLikePost)
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'You must authenticate!', null));
        if (!checkPostExist)
            return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Post not exist', null));
        hasUserLikedPost(postId, usernameLikePost)
            .then((result) => {
                if (result === 1) {
                    return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'User like this post before', null));
                } else {
                    return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'User not like this post before', null));
                }
            })
            .catch((error) => {
                return res.status(500).json(ResponseBase(ResponseStatus.ERROR, 'Error when check user like post', error));
            });
    }
}
