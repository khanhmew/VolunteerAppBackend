import { NextFunction, Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";

export class PostController {
  postServiceInstance!: PostService;

  constructor() {
    this.postServiceInstance = new PostService();
  }

  createPost = async(req: Request, res: Response, next: NextFunction) => {
    
  }
}
