

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { IOChanel } from "./soket-io.config";
import { SocketMetadata } from "./models/soketoi-metadata.model";
import jwt from 'jsonwebtoken';
import { serverConfig } from "../../config/server.config";
import { SECRETKEY } from "../../middleware/token.middleware";
import { ChatRepository } from "../../api/v1/repository/chat/chat.respoitory";

interface UserRoomInfo {
  _id: string;
  team: number;
  roomId: string;
  disconnected: boolean;
}

export class SocketIOServer {
  private readonly chatRepository!: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  start = (port: number, callback: Function) => {
    const httpServer = createServer();
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on(IOChanel.MAIN_CONNECTION, (socket: Socket) => {
      // console.info(`A user connected: ${socket.id}`);

      // Check token in production mode
      let userCreateConnection: any;
      const roomId = socket.handshake?.query?.room_id as string;
      // console.log(`roomId: ${roomId}`)
      if (!roomId) {
        console.error('roomid should not be empty');
        io.to(socket.id).emit(IOChanel.ERROR_CHANEL, {
          code: 602,
          // message: `roomid should not be empty`
        });
        return;
      }

      const accessToken = socket.handshake?.auth?.token._j;
      if (!accessToken) {
        // console.error('accessToken should not be empty');
        io.to(socket.id).emit(IOChanel.ERROR_CHANEL, {
          code: 601,
          message: `accessToken should not be empty`
        });
        return;
      }

      jwt.verify(accessToken, SECRETKEY, (err: any, user: any) => {
        if (err) io.to(socket.id).emit(IOChanel.ERROR_CHANEL, new Error('Invalid token!'));
        userCreateConnection = user;
       // console.log(`user join socket: ${JSON.stringify(user)}`);
        // socket.emit(IOChanel.JOIN_ROOM, {
        //   metadata: userCreateConnection,
        // });
        socket.emit(IOChanel.JOIN_CHAT, {
          metadata: userCreateConnection,
        });
      });
      socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
      });
      socket.on("send_message", async (message: any)=>{
        console.log(`send_message: ${JSON.stringify(message)}`)
        socket.to(roomId).emit("receive_message", message);
        await this.chatRepository.sendMessage(message.userId, roomId,message.message, message.avatar)
      })

    });
    return httpServer.listen(port, callback());
  }
}

