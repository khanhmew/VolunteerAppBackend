import mongoose, { Document, Schema } from 'mongoose';

export interface IMember {
  userId: string;
  groupId: string;
  joinedAt: Date;
}

export interface IMemberModel extends IMember, Document {}

const MemberSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    groupId: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IMemberModel>('Member', MemberSchema);
