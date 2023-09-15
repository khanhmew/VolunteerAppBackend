import {
  ResponseBase,
  ResponseStatus,
} from "../../../shared/response/response.payload";
import { RoomDomainModel } from "../model/room.domain.model";
import { RoomRepository } from "../repository/room/room.repository";


export class RoomService {
  private readonly roomDomainModel!: RoomDomainModel;
  private readonly roomRepository!: RoomRepository;

  constructor() {
    this.roomDomainModel = new RoomDomainModel();
    this.roomRepository = new RoomRepository();
  }

  save(room: any) {
    const roomid = this.roomDomainModel.formatRoomid(room.roomid);

    // const roomStored = await this.roomRepository.getRoomByRoomid(roomid);

    // if (roomStored) {
    //   return ResponseBase(
    //     ResponseStatus.SUCCESS,
    //     "Found room by room id",
    //     roomStored
    //   );
    // }

    return ResponseBase(
      ResponseStatus.SUCCESS,
      "Not found room by room id",
      roomid
    );
  }
}
