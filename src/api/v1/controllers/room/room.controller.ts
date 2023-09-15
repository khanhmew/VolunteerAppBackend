import { NextFunction, Request, Response } from "express";
import { RoomService } from "../../services/room.service";

export class RoomController {
  roomServiceInstance!: RoomService;

  constructor() {
    this.roomServiceInstance = new RoomService();
  }

  saveRoom = (req: Request, res: Response, next: NextFunction) => {
    const saveRoomResponse = this.roomServiceInstance.save(1);
    return res.status(201).json(saveRoomResponse);
  };

  getAll = (req: Request, res: Response, next: NextFunction) => {
    const saveRoomResponse = this.roomServiceInstance.save(1);
    return res.status(200).json(saveRoomResponse);
  };
}
