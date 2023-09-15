import express from "express";
import { RoomController } from "../controllers/room/room.controller";

const roomRoute = express.Router();
const roomControllerInstance = new RoomController();

roomRoute.post("/room", roomControllerInstance.saveRoom);
roomRoute.get("/room", roomControllerInstance.getAll);

export default roomRoute;
