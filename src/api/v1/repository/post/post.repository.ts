import mongoose from 'mongoose';
import Post, { IPost } from '../post/post.entity';
import { UserDomainModel } from '../../model/user.domain.model';
import { UserRepository } from '../user/user.repository';
import { DateFormat, ExpirationDateMustGreaterCurrentDate, OrgNotActive, ParticipantsMustGreaterThan0, PostMustCreateByOrg } from '../../../../shared/error/post.error';
const moment = require('moment');


export class PostRepository {
    private readonly userRepository!: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }
    savePost = async (_post: any) => {
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        const userResultType: any = await this.userRepository.getExistOrgById(_post.ownerId);
        if (userResultType.type == 'Organization') {
            if(userResultType.isActiveOrganization){
                const postSave : any= new Post({
                    _id: new mongoose.Types.ObjectId(),
                    ownerId: _post.ownerId,
                    updatedAt: new Date(),
                    scope: _post.scope,
                    content: _post.content,
                    media: _post.media,
                    numOfComment: 0,
                    commentUrl: '',
                    likes: [],
                    numOfLike: 0,
                    participatedPeople: 0
                })
                if (dateRegex.test(_post.exprirationDate.toString()) && moment(_post.exprirationDate, 'DD-MM-YYYY', true).isValid()) {
                    const currentDate = new Date(); // Lấy thời gian hiện tại
                    const day = currentDate.getDate(); // Lấy ngày
                    const month = currentDate.getMonth() + 1; // Lấy tháng (lưu ý: tháng trong JavaScript bắt đầu từ 0)
                    const year = currentDate.getFullYear(); // Lấy năm
                    const formattedDate = `${day}-${month}-${year}`;
    
                    console.log("Ngày/tháng/năm hiện tại:", formattedDate);
                    const expirationDate = moment(_post.exprirationDate, 'DD-MM-YYYY').toDate(); // Chuyển đổi ngày hết hạn sang đối tượng Date
    
                    if (currentDate < expirationDate) {
                        postSave.exprirationDate = expirationDate;
                        postSave.createdAt = formattedDate;
                    }
                    else {
                        throw new ExpirationDateMustGreaterCurrentDate('ExpirationDateMustGreaterCurrentDate');
                    }
                }
                else {
                    throw new DateFormat('DateFormat');
                }
                const participants: number = _post.participants as number; // Ép kiểu _post.participants thành kiểu number
                if (participants <= 0) {
                    throw new ParticipantsMustGreaterThan0('ParticipantsMustGreaterThan0');
                }
                else{
                    postSave.participants= _post.participants;
                }
                console.log('Post before save: ' + JSON.stringify(postSave));
                return postSave.save();
            }
            else{
                throw new OrgNotActive('OrgNotActive');
            }
        }
        else {
            throw new PostMustCreateByOrg('PostMustCreateByOrg');
        }

    }
}