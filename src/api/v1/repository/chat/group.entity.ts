import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup {
  activityId: string;
  name: string;
  avatar: string;
  totalUser: number;
  createdAt: Date;
  createdBy: string;
  isDelete: string
}

export interface IGroupModel extends IGroup, Document {}

const GroupSchema: Schema = new Schema(
  {
    activityId: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    totalUser: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IGroupModel>('Group', GroupSchema);
