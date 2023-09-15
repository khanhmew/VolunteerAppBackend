import mongoose from "mongoose";
import Room, { IRoom } from "./room.model";

export class RoomRepository {
  saveRoom = (_room: IRoom) => {
    const roomToStore = new Room({
      _id: new mongoose.Types.ObjectId(),
      roomId: _room.roomId,
      createdBy: _room.createdBy,
      createdAt: _room.createdAt,
      players:_room.players,
      currentState:_room.currentState,
    });
    return roomToStore.save();
  };

  getRoomByRoomid = (_roomid: string) => {
    return Room.findOne({
      roomid: _roomid,
    }).select(["roomId", "createBy", "createdAt", "players", "currentState"]);
  };

  getExistRoomByRoomid = (_roomid: string) => {
    return Room.findOne({
      roomid: _roomid,
    }).select(["roomid"]);
  };
}
