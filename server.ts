// Import dependencies && init serverlication express
import express, {Application, NextFunction, Request, Response } from 'express';
import { saveLikeForPost, getTotalLikesForPost } from './src/redis/redisUtils';
const { Client } = require('pg');
import bodyParser from 'body-parser';
import { serverConfig } from './src/config/server.config';
import mongoose from 'mongoose';
import userRoute from './src/api/v1/routes/user.route';
import authRoute from './src/api/v1/routes/auth.route';
import chatRoute from './src/api/v1/routes/chat.route';
import activityRoute from './src/api/v1/routes/activity.route';
import axios from 'axios';
import { CORSMiddleware } from './src/middleware/CORS.middleware';
import { SocketIOServer } from './src/socket/v1/socket-io.server';
import { ResponseBase, ResponseStatus } from './src/shared/response/response.payload';
import { Sequelize } from 'sequelize';
import { authenticateToken } from './src/middleware/token.middleware';
import postRoute from './src/api/v1/routes/post.route';

// const newRedis = new Redis({
//   port: 12586,
//   host: 'redis-12586.c244.us-east-1-2.ec2.cloud.redislabs.com',
//   password: 'h0StMgZf2IilbJnKH0gmwYkgQuLET8x4',
//   connectTimeout: 10000
// });

// newRedis.set('example_key', 'example_value');
// newRedis.get('example_key', (err: any, result: any) => {
//   if (err) {
//     console.error('Lỗi:', err);
//   } else {
//     console.log('Giá trị:', result);
//   }
// });

const server: Application = express();

export const routes = express.Router();

// compress response
const compression = require("compression");
server.use(compression());

// Secure our api
const helmet = require("helmet");
server.use(helmet());

// Use morgan
const morgan = require('morgan');
server.use(morgan('combined'));

// Connect to mongodb
console.info(' ↻ [server]: Waitting for connect to mongodb ...');
mongoose.set('strictQuery', true);
mongoose
  .connect(serverConfig.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
    console.info('✅ [server]: Connected to mongodb');
  })
  .catch((err) => {
    console.error(err);
  })


//Connect to postgre
// Create a new PostgreSQL client
const client = new Client(serverConfig.postgre);

// Connect to the PostgreSQL database
client.connect()
  .then(() => {
    console.info('✅ [server]: Connected to PostgreSQL database');
    // Perform database operations here
  })
  .catch((error: Error) => {
    console.error('Error connecting to PostgreSQL database:', error.message);
  }).finally(() => {
    client.end()
      .then(() => console.info('Disconnected from PostgreSQL database'))
      .catch((disconnectError: any) => console.error('Error disconnecting from PostgreSQL database:', disconnectError.message))
  });

// Start server
const startHTTPServer = () => {
  // Configure request size
  server.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
  server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Configure routes
  server.use(CORSMiddleware);
  const url = serverConfig.api.path;
  server.use(serverConfig.api.path, routes);
  routes.use(userRoute);
  routes.use(authRoute);
  routes.use(postRoute);
  routes.use(chatRoute);
  routes.use(activityRoute);

  // server.use('',  (req: Request, res: Response, next: NextFunction) => {
  //   return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'I need U'));
  // })


  const port = serverConfig.server.port;
  server.listen(port, () => {
    console.log(`⚡️ [server]: Server is running at: http://127.0.0.1:${port}`);
  });

  async function getIP() {
    await axios.get('https://api.ipify.org').then((response) => {
      console.log(`[server] IP: ${response.data}`);
    })
  }
  getIP();
}
const startSocketIOServer = () => {
  const ioPort = serverConfig.socketIOServer.port as number;
  const socketIO = new SocketIOServer();
  socketIO.start(ioPort, () => {
    console.log(`⚡️ [io]: Socket IO server running at: http://localhost:${ioPort}`);
  });
}
startHTTPServer();
startSocketIOServer();