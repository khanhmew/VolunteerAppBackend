import mongoose from 'mongoose';
import Post from '../post/post.entity';
import Comment from '../post/comment/comment.entity';
import Activity from '../activity/activity.entity';
import User from '../user/user.entity';
import Join from '../activity/join.entity';
import { UserDomainModel } from '../../model/user.domain.model';
import { UserRepository } from '../user/user.repository';
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from '../../../../shared/error/post.error';
import { ActivityRepository } from '../activity/activity.repository';
import { getTotalLikesForPost, redisClient } from '../../../../redis/redisUtils';
import { PostDTO } from '../../DTO/post.dto';
import { FollowRepository } from '../follow/follow.repository';
import { getLocationFromAddress } from '../../services/location.service';
import { commentDTO } from '../../DTO/comment.dto';
const moment = require('moment');
const { point, distance } = require('@turf/turf');


export class PostRepository {
    private readonly userRepository!: UserRepository;
    private readonly activityRepository!: ActivityRepository;
    private readonly followRepository!: FollowRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.activityRepository = new ActivityRepository();
        this.followRepository = new FollowRepository();
        this.followRepository = new FollowRepository();
    }

    checkPostExist = async (_postId: any) => {
        try {
            const post = await Post.findOne({
                _id: _postId
            });
            return post;
        } catch (error) {
            console.error('Error getting post by ID:', error);
            throw error;
        }
    }

    checkPostExists = async (_postId: any) => {
        try {
            const post = await Post.exists({
                _id: _postId
            });
            if (post)
                return true;
            return false;
        } catch (error) {
            console.error('Error getting post by ID:', error);
            throw error;
        }
    }

    savePost = async (_post: any) => {
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        const userResultType: any = await this.userRepository.getExistOrgById(_post.ownerId);
        const orgInformationCreatePost: any = await this.userRepository.getExistOrgById(_post.ownerId);
        if (userResultType.type == 'Organization') {
            if (userResultType.isActiveOrganization) {
                const postSave: any = new Post({
                    _id: new mongoose.Types.ObjectId(),
                    type: _post.type,
                    ownerId: _post.ownerId,
                    updatedAt: new Date(),
                    scope: _post.scope,
                    content: _post.content,
                    media: _post.media,
                    numOfComment: 0,
                    commentUrl: '',
                })
                var expirationDate = new Date;
                if (dateRegex.test(_post.exprirationDate.toString()) && moment(_post.exprirationDate, 'DD-MM-YYYY', true).isValid()) {
                    const currentDate = new Date(); // Lấy thời gian hiện tại
                    const day = currentDate.getDate(); // Lấy ngày
                    const month = currentDate.getMonth() + 1; // Lấy tháng (lưu ý: tháng trong JavaScript bắt đầu từ 0)
                    const year = currentDate.getFullYear(); // Lấy năm
                    const formattedDate = `${day}-${month}-${year}`;

                    // console.log("Ngày/tháng/năm hiện tại:", formattedDate);
                    expirationDate = moment(_post.exprirationDate, 'DD-MM-YYYY').toDate(); // Chuyển đổi ngày hết hạn sang đối tượng Date

                    if (currentDate < expirationDate) {
                        postSave.createdAt = currentDate;
                    }
                    else {
                        throw new ExpirationDateMustGreaterCurrentDate('ExpirationDateMustGreaterCurrentDate');
                    }
                }
                else {
                    throw new DateFormat('DateFormat');
                }
                const postResult = await postSave.save();
                //#region POST TYPE -> CREATE POST 
                if (postSave.type.toLowerCase() == 'activity') {
                    const activityCreate = new Activity({
                        postId: postResult._id,
                        address: orgInformationCreatePost.address,
                        participatedPeople: [],
                        exprirationDate: expirationDate,
                        dateActivity: _post.dateActivity,
                        ownerId: _post.ownerId
                    })

                    //_post.participants: là body nhận vào -> lưu vào bảng activites
                    const participants: number = _post.participants as number; // Ép kiểu _post.participants thành kiểu number
                    if (participants <= 0) {
                        throw new ParticipantsMustGreaterThan0('ParticipantsMustGreaterThan0');
                    }
                    else {
                        activityCreate.participants = _post.participants;
                    }

                    const activityResultCreate = await this.activityRepository.createNewActivity(activityCreate);
                    postSave.activityId = activityResultCreate._id;
                    await postSave.save();
                }
                //#endregion POST TYPE
                //#region REDIS CACHE
                const cacheKey = `posts:page:1`;
                let postsInformation: any = [];

                // Kiểm tra xem danh sách postsInformation có trong cache hay không
                const cachedPosts = await redisClient.get(cacheKey);
                if (cachedPosts) {
                    postsInformation = JSON.parse(cachedPosts);
                }

                // Kiểm tra xem post mới đã có trong cache hay chưa
                const isPostInCache = postsInformation.some((postInfo: any) => postInfo._id === postResult._id);

                if (!isPostInCache) {
                    postsInformation.unshift(postSave);
                    await redisClient.set(cacheKey, JSON.stringify(postsInformation));
                }
                return postSave;
            }
            else {
                throw new OrgNotActive('OrgNotActive');
            }
        }
        else {
            throw new PostMustCreateByOrg('PostMustCreateByOrg');
        }

    }


    // getAllPosts = async (page: any, limit: any) => {
    //     try {
    //         const skip = (page - 1) * limit;

    //         const posts = await Post.find()
    //             .sort({ createdAt: -1 })
    //             .skip(skip)
    //             .limit(limit);

    //         return posts;
    //     } catch (error) {
    //         console.error('Error getting all posts:', error);
    //         throw error;
    //     }
    // }

    getAllPosts = async (page: any, limit: any, userId: any) => {
        try {
            var cacheJoinedPost: any = [];
            const cachedPosts = await redisClient.get(`posts:page:${page}`);
            const isUserLoggedIn = !!userId;
            if (!isUserLoggedIn && cachedPosts) {
                return { posts: JSON.parse(cachedPosts), joinedPost: [] };
            }
            const cachedPostidJoined = await redisClient.get(`posts_joined:page:${page}:userId:${userId}`);
            if (cachedPosts && cachedPostidJoined) {
                return { posts: JSON.parse(cachedPosts), joinedPost: JSON.parse(cachedPostidJoined) };
            } else {
                const skip = (page - 1) * limit;

                const posts = await Post.find()
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit);

                const postsInformation = await Promise.all(posts.map(async (post: any) => {
                    const orgInformationCreatePost: any = await this.userRepository.getExistOrgById(post.ownerId);
                    let isJoin: boolean | undefined = undefined;
                    let isUserFollowingOrg: boolean | undefined = undefined;
                    if (isUserLoggedIn) {
                        isJoin = await this.activityRepository.isJoined(userId, post.activityId);
                        const userFollowedOrgs = await this.followRepository.getOrgsFollowedByUser(userId);
                        isUserFollowingOrg = userFollowedOrgs.some((org: any) => org.followingId == post.ownerId);
                    }
                    const activityInformation: any = await this.activityRepository.getActivityById(post.activityId);
                    // Create a PostDTO without the likes and totalLikes fields
                    const postDTO: Omit<PostDTO, 'likes' | 'totalLikes'> = {
                        _id: post._id,
                        type: post.type,
                        ownerId: post.ownerId,
                        ownerDisplayname: orgInformationCreatePost.fullname,
                        ownerAvatar: orgInformationCreatePost.avatar,
                        address: orgInformationCreatePost.address,
                        updatedAt: post.updatedAt,
                        createdAt: post.createdAt,
                        scope: post.scope,
                        content: post.content,
                        media: post.media,
                        activityId: post.activityId,
                        exprirationDate: activityInformation?.exprirationDate,
                        // isJoin,
                        numOfComment: post.numOfComment,
                        commentUrl: post.commentUrl,
                        participants: activityInformation.participants,
                        // isFollow: isUserFollowingOrg,
                        totalUserJoin: activityInformation.numOfPeopleParticipated,
                        isExprired: activityInformation?.isExprired
                    };
                    if (isJoin) {
                        console.log(`post user join: ` + post._id)
                        cacheJoinedPost.push(post._id)
                    }
                    return postDTO;
                }));
                await redisClient.set(`posts:page:${page}`, JSON.stringify(postsInformation));
                await redisClient.set(`posts_joined:page:${page}:userId:${userId}`, JSON.stringify(cacheJoinedPost));
                await redisClient.expire(`posts:page:${page}`, 900);
                await redisClient.expire(`posts_joined:page:${page}:userId:${userId}`, 900); //15 phút
                return { posts: postsInformation, joinedPost: cacheJoinedPost };
            }
        } catch (error) {
            console.error('Error getting all posts:', error);
            throw error;
        }
    }
    async getAllPostUserFollow(page: any, limit: any, userId: any) {
        try {
            const skip = (page - 1) * limit;
            const organizationsUserFollows = await this.followRepository.getAllFollowingIds(userId);
            const postsOfFollowedOrganizations = await Post.find({ ownerId: { $in: organizationsUserFollows } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            return postsOfFollowedOrganizations;
        } catch (error) {
            console.error('Error getting all posts:', error);
            throw error;
        }
    }


    async getAllPostsByOrg(orgId: any, page: any, limit: any) {
        try {
            const posts = await Post.find({ ownerId: orgId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            return posts;
        } catch (error) {
            console.error('Error when getting posts by org ID:', error);
            throw error;
        }
    }

    getDetailPost = async (_postId: any, _userId: any) => {
        try {
            const post: any = await Post.findOne({ _id: _postId });
            const activityResult: any = await this.activityRepository.getActivityById(post.activityId);
            const orgInformationPost: any = await this.userRepository.getExistOrgById(post.ownerId);

            if (_userId == '') {
                const postDetail: PostDTO = {
                    _id: post._id,
                    type: post.type,
                    ownerId: post.ownerId,
                    ownerDisplayname: orgInformationPost.fullname,
                    ownerAvatar: orgInformationPost.avatar,
                    address: orgInformationPost.address,
                    updatedAt: post.updatedAt,
                    createdAt: post.createAt,
                    exprirationDate: activityResult.exprirationDate,
                    scope: post.scope,
                    content: post.content,
                    media: post.media,
                    activityId: post.activityId,
                    numOfComment: post.numOfComment,
                    commentUrl: post.commentUrl,
                    participants: activityResult.participants,
                    likes: [],
                    totalLikes: 0,
                    totalUserJoin: activityResult.numOfPeopleParticipated,
                    isExprired: activityResult?.isExprired,
                    dateActivity: activityResult.dateActivity
                };

                const likes = await getTotalLikesForPost(_postId); // Await the total likes

                postDetail.likes = likes;
                postDetail.totalLikes = likes.length;

                return postDetail;
            }
            else {
                const isJoin: any = await this.activityRepository.isJoined(_userId, post.activityId);
                const isFollowing = await this.followRepository.isUserFollowingOrg(_userId, post.ownerId);
                const postDetail: any = {
                    _id: post._id,
                    type: post.type,
                    ownerId: post.ownerId,
                    ownerDisplayname: orgInformationPost.fullname,
                    ownerAvatar: orgInformationPost.avatar,
                    address: orgInformationPost.address,
                    updatedAt: post.updatedAt,
                    exprirationDate: activityResult.exprirationDate,
                    scope: post.scope,
                    content: post.content,
                    media: post.media,
                    activityId: post.activityId,
                    numOfComment: post.numOfComment,
                    commentUrl: post.commentUrl,
                    participants: activityResult.participants,
                    likes: [],
                    totalLikes: 0,
                    isJoin: isJoin,
                    isFollowing: isFollowing,
                    totalUserJoin: activityResult.numOfPeopleParticipated,
                    isExprired: activityResult?.isExprired,
                    dateActivity: activityResult.dateActivity
                };

                const likes = await getTotalLikesForPost(_postId); // Await the total likes

                postDetail.likes = likes;
                postDetail.totalLikes = likes.length;
                const userForCheckType = await this.userRepository.getExistOrgById(_userId);
                if (userForCheckType?.type.toLocaleLowerCase() == 'user' && isJoin == true) {
                    const isAttendedCheck = await this.activityRepository.isAttended(_userId, post.activityId);
                    postDetail.isAttended = isAttendedCheck
                }
                else if (userForCheckType?.type.toLocaleLowerCase() == 'organization' && orgInformationPost._id == _userId) {
                    postDetail.qrCode = activityResult.qrCode;
                    postDetail.isEnableQr = activityResult.isEnableQr;
                }
                return postDetail;
            }

        } catch (error) {
            console.error('Error:', error);
            throw error; // You should handle or propagate the error as needed
        }
    }

    async getNearbyPosts(userAddress: any, page: any, limit: any) {
        try {
            // Lấy vị trí từ địa chỉ người dùng
            const userLocation = await getLocationFromAddress(userAddress);

            // Kiểm tra nếu userLocation không tồn tại hoặc không có thuộc tính coordinates
            if (!userLocation?.coordinates) {
                throw new Error('Invalid user location');
            }

            // Tính toán bounding box để giới hạn kết quả
            const bbox = distance(
                point(userLocation?.coordinates),
                point([userLocation?.coordinates[0], userLocation.coordinates[1] + 1]),
                { units: 'kilometers' }
            );

            // Kiểm tra nếu bbox không tồn tại, sử dụng bounding box mặc định
            const boundingBox = Array.isArray(bbox)
                ? bbox
                : [[-180, -90], [180, 90]];

            // Truy vấn MongoDB sử dụng 2dsphere index và bounding box
            const nearbyPosts = await Post.find({
                location: {
                    $geoWithin: {
                        $geometry: {
                            type: 'Polygon',
                            coordinates: [boundingBox]
                        }
                    }
                }
            })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();

            return nearbyPosts;
        } catch (error) {
            console.error('Error getting nearby posts:', error);
            throw error;
        }
    }

    //#region COMMENT 
    async getAllCommentAPost(_postId: any, _page: any, _limit: any) {
        const comments = await Comment.find({ postId: _postId })
            .sort({ createdAt: -1 })
            .skip((_page - 1) * _limit)
            .limit(_limit)
            .exec();
        return comments;

    }

    async commentAPost(_ownerId: any, _postId: any, _content: any) {
        const checkExistUser = await this.userRepository.checkUserExist(_ownerId);
        const checkPostExist = await this.checkPostExists(_postId);
        if (!checkExistUser)
            return ({ error: 'User not exist' });
        if (!checkPostExist)
            return ({ error: 'Post not exist' });
        const newComment = new Comment({
            postId: _postId,
            ownerId: _ownerId,
            content: _content,
            parentId: null,
        });
        newComment.save();
        const userComment = await this.userRepository.getExistUserById(_ownerId);
        const commentResult: commentDTO = ({
            _id: newComment._id,
            content: _content,
            postId: _postId,
            ownerId: _ownerId,
            createAt: newComment.createAt,
            ownerAvatar: userComment?.avatar,
            ownerDisplayname: userComment?.fullname
        })
        return ({ success: 'Save success', comment: commentResult })
    }

    async replyAComment(_ownerId: any, _postId: any, _content: any, _commentParentId: any) {
        const checkExistUser = await this.userRepository.checkUserExist(_ownerId);
        const checkPostExist = await this.checkPostExists(_postId);
        if (!checkExistUser)
            return ({ error: 'User not exist' });
        if (!checkPostExist)
            return ({ error: 'Post not exist' });
        const newComment = new Comment({
            postId: _postId,
            ownerId: _ownerId,
            content: _content,
            parentId: _commentParentId,
        });
        newComment.save();
        const userComment = await this.userRepository.getExistUserById(_ownerId);
        const commentResult: commentDTO = ({
            _id: newComment._id,
            content: _content,
            postId: _postId,
            ownerId: _ownerId,
            createAt: newComment.createAt,
            ownerAvatar: userComment?.avatar,
            ownerDisplayname: userComment?.fullname,
            parentId: _commentParentId
        })
        return ({ success: 'Save success', comment: commentResult })
    }

    //#endregion


    //attendance
    async attendance(_postId: any, _userId: any) {
        try {
            const checkPostExist = Post.findById(_postId);
            if (!checkPostExist)
                return ({ error: 'Post does not exist' })
            const checkUserType = await User.findById(_userId);
            if (checkUserType?.type && checkUserType.type.trim().toLocaleLowerCase() === 'USER')
                return ({ error: 'Type must be user' })
            const activityIdForJoin = await this.activityRepository.findActIdBasePost(_postId);
            const join = await Join.findOne({ activityId: activityIdForJoin, userId: _userId });
            await Join.updateOne({ _id: join?._id }, { $set: { isAttended: true, timeAttended: new Date() } });
            const postResult = await this.getDetailPost(_postId, _userId)
            return ({ success: 'Verify success', join: postResult });
        }
        catch (error) {
            return ({ error: error })
        }
    }
}   