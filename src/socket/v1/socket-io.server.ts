

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { IOChanel } from "./soket-io.config";
import { SocketMetadata } from "./models/soketoi-metadata.model";
import jwt from 'jsonwebtoken';
import { serverConfig } from "../../config/server.config";
import { SECRETKEY } from "../../middleware/token.middleware";
interface UserRoomInfo {
  _id: string;
  team: number;
  roomId: string;
  disconnected: boolean;
}

export class SocketIOServer {
  

  start = (port: number, callback: Function) => {
    const httpServer = createServer();
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on(IOChanel.MAIN_CONNECTION, (socket: Socket) => {
      console.info(`A user connected: ${socket.id}`);

      // Check token in production mode
      let userCreateConnection: any;
      const roomId = socket.handshake?.query?.room_id as string;
      if (!roomId) {
        console.error('roomid should not be empty');
        io.to(socket.id).emit(IOChanel.ERROR_CHANEL, {
          code: 602,
          message: `roomid should not be empty`
        });
        return;
      }

        const accessToken = socket.handshake?.auth?.token;
        if (!accessToken) {
          console.error('accessToken should not be empty');
          io.to(socket.id).emit(IOChanel.ERROR_CHANEL, {
            code: 601,
            message: `accessToken should not be empty`
          });
          return;
        }

        jwt.verify(accessToken, SECRETKEY, (err: any, user: any) => {
          if (err) io.to(socket.id).emit(IOChanel.ERROR_CHANEL, new Error('Invalid token!'));
          userCreateConnection = user;
          console.log(user);
          // socket.emit(IOChanel.JOIN_ROOM, {
          //   metadata: userCreateConnection,
          // });
          socket.emit(IOChanel.JOIN_CHAT, {
            metadata: userCreateConnection,
          });
        });


      socket.on(IOChanel.JOIN_ROOM, async () => {
        try {
          const roomId = socket.handshake?.query?.room_id as string;
          // const joinRoomData = await this.soketRoomSercice.joinGameRoomByRoomId(roomId, userCreateConnection)
          // io.to(roomId).emit(IOChanel.JOIN_ROOM, joinRoomData);
          // console.log(`User id ${socket.id} just join room: ${roomId} Join room data: ${JSON.stringify(joinRoomData)}`);
        } catch (error) {
          console.error(error);
          io.to(socket.id).emit(IOChanel.ERROR_CHANEL, {
            code: 604,
            message: `Lỗi chưa xác định: ${error}`,
          });
        }
      })

      socket.on(IOChanel.JOIN_CHAT, async (data) => {
        try {
          console.log('Start join chat');
          if (!data) {
            console.error('roomid should not be empty');
            return;
          }

        } catch (error) {
          console.error(error);
        }
      })
      socket.on(IOChanel.LEAVE_ROOM, (room: string, metadata: SocketMetadata) => {
        socket.leave(room);
      });

      socket.on(IOChanel.ERROR_CHANEL, () => {
        console.log(`Error chanel on connection`);
      });

      socket.on(IOChanel.GAME_CHANEL, (metadata: any, nextTurnTeam: string, chsIsDead: any) => {
        const roomId = socket.handshake?.query?.room_id as string;

        
      });
      // socket.on(IOChanel.JOIN_CHAT, async (data) => {
      //   try {
      //     console.log('Start join chat');
      //     if (!data) {
      //       console.error('roomid should not be empty');
      //       return;
      //     }

      //     const joinRoomResponse = await this.soketRoomSercice.checkRoomExist(
      //       data
      //     );
      //     console.log('join room response: ' + joinRoomResponse);
      //     if (joinRoomResponse != null) {
      //       socket.join(data);
      //       console.log('user: ' + userCreateConnection.username + ' join chat room: ' + data + '  success')
      //     }
      //     else {
      //       console.log('not room response')
      //       throw new Error('Room not exist');
      //     }
      //   } catch (error) {
      //     console.error(error);
      //   }
      // })

      socket.on(IOChanel.CHAT_CHANEL_SEND, (data) => {
        console.log('message receive from front end: ' + JSON.stringify(data))
        io.to(data.room).emit(IOChanel.CHAT_CHANEL_RECEIVE, data);
      });

      socket.on(IOChanel.GAME_CHANEL_WINNER, (metadata: any) => {
        const roomId = socket.handshake?.query?.room_id as string;
        console.log(`Some one win from game chanel`, roomId, 'Winner:', metadata);
        io.to(roomId).emit(IOChanel.GAME_CHANEL_WINNER, metadata);
      });

      socket.on(IOChanel.DISCONECTION_CHANEL, () => {
        // TODO: Handle disconnect
        // this.soketRoomSercice.leaveRoom('', {
        //   user: '',
        // });
        // console.log(`Some one push data from game chanel`, roomId, 'Đến lược', nextTurnTeam);
      });
    });
    return httpServer.listen(port, callback());
  }
}

