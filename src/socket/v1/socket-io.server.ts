

import { createServer } from "http";
import { Server, Socket } from "socket.io";


export class SocketIOServer {
  start = (port: number) => {
    const httpServer = createServer();
    const io = new Server(httpServer, {
      // ...
    });

    io.on("connection", (socket: Socket) => {
      // ...
    });

    httpServer.listen(port, () => {
      console.log(`⚡️ [io]: Socket IO server running at: http://localhost:${port}`);
    });
  }
}
