import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../shared/error/post.error";
import {
  ResponseBase,
  ResponseStatus,
} from "../../../shared/response/response.payload";
import { PostRepository } from "../repository/post/post.repository";



export class PostService {
  private readonly postRepository!: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  async savePost(_post: any) {
    try {
      const postSave = await this.postRepository.savePost(_post);
      if (postSave)
        return postSave;
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
