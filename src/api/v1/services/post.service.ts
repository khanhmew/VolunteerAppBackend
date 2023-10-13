import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../shared/error/post.error";
import {
  ResponseBase,
  ResponseStatus,
} from "../../../shared/response/response.payload";
import { PostRepository } from "../repository/post/post.repository";
import { UserRepository } from "../repository/user/user.repository";



export class PostService {
  private readonly postRepository!: PostRepository;
  private readonly userRepository!: UserRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
  }

  async savePost(_post: any) {
    try {
      const postSave = await this.postRepository.savePost(_post);
      const orgInformationCreatePost : any= await this.userRepository.getExistOrgById(postSave.ownerId);
      const postInformation = {
        _id: postSave._id,
        ownerId: postSave.ownerId,
        ownerDisplayname: orgInformationCreatePost.fullname,
        ownerAvatar: orgInformationCreatePost.avatar,
        address: orgInformationCreatePost.address,
        updatedAt: postSave.updatedAt,
        scope: postSave.scope,
        content:postSave.content,
        media: postSave.media,
        numOfComment: postSave.numOfComment,
        commentUrl:postSave.commentUrl,
        likes: postSave.likes,
        numOfLike: postSave.numOfLike,
        participatedPeople: postSave.participatedPeople 
      }
      if (postSave){
        return postInformation;
      }
        
    } catch (error: any) {
      if (error instanceof PostMustCreateByOrg) {
        throw new PostMustCreateByOrg('PostMustCreateByOrg');
      }
      else if (error instanceof ExpirationDateMustGreaterCurrentDate) {
        throw new ExpirationDateMustGreaterCurrentDate('ExpirationDateMustGreaterCurrentDate');
      }
      else if (error instanceof DateFormat) {
        throw new DateFormat('DateFormat');
      }
      else if (error instanceof ParticipantsMustGreaterThan0) {
        throw new ParticipantsMustGreaterThan0('ParticipantsMustGreaterThan0');
      }
      else if (error instanceof OrgNotActive) {
        throw new OrgNotActive('OrgNotActive');
      }
    }
  }
}
