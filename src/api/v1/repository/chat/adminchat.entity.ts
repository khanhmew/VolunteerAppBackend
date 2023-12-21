import { DataTypes, Model, Sequelize } from 'sequelize';
import { initMemberModel } from './memberpg.entity';

interface IAdminChat {
    adminchatid: string,
    userid: string,
    adminid: string;
    userfullname: string;
    useravatar: string;
}

class AdminChat extends Model<IAdminChat> { }

const initAdminChatModel = (sequelize: Sequelize) => {
    AdminChat.init(
        {
            adminchatid: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            userid: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            adminid: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            userfullname: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            useravatar: {
                type: DataTypes.STRING,
                allowNull: true,
            }
        },
        {
            sequelize,
            modelName: 'adminchat',
            timestamps: false,
        }
    );

    return AdminChat;
};

export { initAdminChatModel };
