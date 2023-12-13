// memberpg.entity.ts
import { DataTypes, Model, Sequelize } from 'sequelize';
import { initGroupModel } from './grouppg.entity';

interface IMember {
  memberid: string; // Add memberId as a primary key
  userid: string;
  groupid: string;
  joinedat: Date;
}

class Member extends Model<IMember> { }

export const initMemberModel = (sequelize: Sequelize) => {
  Member.init(
    {
      memberid: {
        type: DataTypes.STRING,
        primaryKey: true, // Set memberId as primary key
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
      joinedat: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    },
    {
      sequelize,
      modelName: 'member',
      timestamps: false,
    }
  );

  return Member;
};
