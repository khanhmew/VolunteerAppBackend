import mongoose from 'mongoose';
import Post from '../post/post.entity';
import Activity from '../activity/activity.entity';
import { UserDomainModel } from '../../model/user.domain.model';
import { UserRepository } from '../user/user.repository';
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from '../../../../shared/error/post.error';
import { ActivityRepository } from '../activity/activity.repository';
import { getTotalLikesForPost } from '../../../../redis/redisUtils';
import { PostDTO } from '../../DTO/post.dto';
import { FollowRepository } from '../follow/follow.repository';
import { getLocationFromAddress } from '../../services/location.service';
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
                await postSave.save();
                //#region POST TYPE -> CREATE POST 
                if (postSave.type.toLowerCase() == 'activity') {
                    const activityCreate = new Activity({
                        postId: postSave,
                        address: orgInformationCreatePost.address,
                        participatedPeople: [],
                        exprirationDate: expirationDate
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

    // async getAllPosts(page: any, limit: any, userId: any) {
    //     try {
    //         const skip = (page - 1) * limit;

    //         const organizationsUserFollows = await this.followRepository.getAllFollowingIds(userId);

    //         const allPosts = await Post.find()
    //             .sort({ createdAt: -1 })
    //             .skip(skip)
    //             .limit(limit);

    //         const postsOfFollowedOrganizations = [];
    //         const otherPosts : any= [];

    //         // Chia bài viết thành hai mảng riêng biệt
    //         allPosts.forEach((post: any) => {
    //             if (organizationsUserFollows.includes(post.ownerId.toString())) {
    //                 postsOfFollowedOrganizations.push(post);
    //             } else {
    //                 otherPosts.push(post);
    //             }
    //         });

    //         // Thêm bài viết từ tổ chức bạn đang theo dõi vào đầu mảng tất cả bài viết
    //         postsOfFollowedOrganizations.push(...otherPosts);

    //         return postsOfFollowedOrganizations;
    //     } catch (error) {
    //         console.error('Error getting all posts:', error);
    //         throw error;
    //     }
    // }

    getAllPosts = async (page: any, limit: any) => {
        try {
            const skip = (page - 1) * limit;

            const posts = await Post.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            return posts;
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
                    totalUserJoin: activityResult.participatedPeople.length,
                    isExprired: activityResult?.isExprired
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
                    totalUserJoin: activityResult.participatedPeople.length,
                    isExprired: activityResult?.isExprired
                };

                const likes = await getTotalLikesForPost(_postId); // Await the total likes

                postDetail.likes = likes;
                postDetail.totalLikes = likes.length;

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


}