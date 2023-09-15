import { ObjectId, Types } from "mongoose";

import { RoomCreatedResponse } from "../controllers/room/dto/room.response";
import { CurrentState } from "../repository/room/room.model";

export class RoomDomainModel {
  save = (data: any) => {
    return null;
  };

  formatRoomid = (roomid: string): RoomCreatedResponse => {
    // Generate a random room ID using generateRandomRoomid
    const roomId = new Types.ObjectId();

    // Business logic

    return {
      roomId: roomId,
      createdBy: "Phan Quynh",
      createdAt: new Date(),
      players: [],
      currentState: CurrentState.WAITING,
    };
  };
}
