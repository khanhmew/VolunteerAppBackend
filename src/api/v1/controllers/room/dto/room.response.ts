import { ObjectId } from "mongoose";

export interface RoomCreatedResponse {
  roomId: ObjectId | any;
  createdBy: ObjectId | any; // Có thể là user_id hoặc username của người tạo
  createdAt: Date;
  players: ObjectId[]; // Danh sách các người chơi, có thể là user_id hoặc username
  currentState: string;
}
