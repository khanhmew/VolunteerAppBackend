import mongoose, { Document, ObjectId, Schema } from "mongoose";


export interface IRoom {
  roomId: ObjectId,
  createdBy: ObjectId,
  createdAt: Date,
  players: ObjectId[], // Danh sách các người chơi, có thể là user_id hoặc username
  currentState: string,
}

export interface IRoomModel extends IRoom, Document {}

const IRoomSchema: Schema = new Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, required: true },
    players: { type: mongoose.Schema.Types.ObjectId, required: true },
    currentState: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IRoomModel>("Room", IRoomSchema);

export const DefaultRoomData = (
  roomId: ObjectId,
  createBy: ObjectId,
  players: ObjectId[],
  currentState: string,
 

) => {
  const iRoom: IRoom = {
    roomId: roomId,
    createdBy: createBy,
    createdAt: new Date(),
    players:players,
    currentState:currentState
  };
  return iRoom;
};

export enum CurrentState{
  WAITING = 'Đang chờ',
  PLAY = 'Đang chơi',
  ENDGAME = 'Kết thúc'
}