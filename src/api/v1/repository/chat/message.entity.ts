// Messagepg.entity.ts
import { DataTypes, Model, Sequelize } from 'sequelize';

interface IMessage {
    messageid: string; // Add MessageId as a primary key
    userid: string;
    userImage: string;
    groupid: string;
    sendAt: Date;
    isRead: boolean;
    content: string
}

class Message extends Model<IMessage> { }

export const initMessageModel = (sequelize: Sequelize) => {
    Message.init(
        {
            messageid: {
                type: DataTypes.STRING,
                primaryKey: true, // Set MessageId as primary key
                allowNull: false,
            },
            userid: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            groupid: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            sendAt: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.fn('now'),
            },
            userImage: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isRead:{
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            content: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'Message',
            timestamps: false,
        }
    );

    return Message;
};
