import mongoose from 'mongoose';
import Post, { IPost } from '../post/post.entity';

export class PostRepository {
    savePost = async(_post: IPost) => {
        const postSave = new Post({
            _id: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date(),
            exprirationDate: _post.exprirationDate,
            scope: _post.scope,
            content: _post.content,
            media: _post.media,
            numOfComment: 0,
            commentUrl: '',
            likes: [],
            numOfLike: 0,
            participants: _post.participants,
            participatedPeople: 0
        })
        return postSave.save();
    }
}