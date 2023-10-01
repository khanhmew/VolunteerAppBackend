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
      const postSave = await this.postRepository.savePost(_post);
      return postSave;
    }  
}
  