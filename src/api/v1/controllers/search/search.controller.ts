import { NextFunction, Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { ResponseBase, ResponseStatus } from "../../../../shared/response/response.payload";
import { uploadImageFromFormData } from "../../services/firebase.service";
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from "../../../../shared/error/post.error";
import { PostRepository } from "../../repository/post/post.repository";
import { getTotalLikesForPost, hasUserLikedPost, saveLikeForPost, unlikeForPost } from "../../../../redis/redisUtils";
import mongoose, { isValidObjectId } from "mongoose";
import { autocompleteSearch, search } from "../../services/search.service";
export class SearchController {

    search = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query_string, default_field } = req.body.params;

            const result = await search(query_string, default_field);

            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    autoComplete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query_string } = req.body.params;

            const result = await autocompleteSearch(query_string);

            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

}
