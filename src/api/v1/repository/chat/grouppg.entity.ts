import { DataTypes, Model, Sequelize } from 'sequelize';

interface IGroup {
  groupid: string,
  activityid: string;
  name: string;
  avatar: string;
  totaluser: number;
  createdby: string;
  createdat: Date;
  isdelete: boolean;
}

class Group extends Model<IGroup> {}

const initGroupModel = (sequelize: Sequelize) => {
  Group.init(
    {
      groupid: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      activityid: {
        type: DataTypes.STRING, // Phù hợp với UUID trong PostgreSQL
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      totaluser: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      createdby: {
        type: DataTypes.STRING, // Phù hợp với UUID trong PostgreSQL
        allowNull: false,
      },
      createdat: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      isdelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Group',
      timestamps: false, // PostgreSQL tự quản lý timestamps
    }
  );

  return Group;
};

export { initGroupModel };
