// Import dependencies && init serverlication express
import express, { Application, NextFunction, Request, Response } from 'express';

import bodyParser from 'body-parser';
import { serverConfig } from './src/config/server.config';
import mongoose from 'mongoose';
import userRoute from './src/api/v1/routes/user.route';
import authRoute from './src/api/v1/routes/auth.route';
import axios from 'axios';
import { CORSMiddleware } from './src/middleware/CORS.middleware';
import { SocketIOServer } from './src/socket/v1/socket-io.server';
import { ResponseBase, ResponseStatus } from './src/shared/response/response.payload';

import { authenticateToken } from './src/middleware/token.middleware';
import postRoute from './src/api/v1/routes/post.route';

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

// Start server
const startHTTPServer = () => {
  // Configure request size
  server.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
  server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Configure routes
  server.use(CORSMiddleware);
  server.use(serverConfig.api.path, routes);
  routes.use(userRoute);
  routes.use(authRoute);
  routes.use(postRoute);

  // server.use('',  (req: Request, res: Response, next: NextFunction) => {
  //   return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'I need U'));
  // })


  const port = serverConfig.server.port;
  server.listen(port, () => {
    console.log(`⚡️ [server]: Server is running at: http://localhost:${port}`);
  });

  async function getIP() {
    await axios.get('https://api.ipify.org').then((response) => {
      console.log(`[server] IP: ${response.data}`);
    })
  }
  getIP();
}

const startSocketIOServer = () => {
  const socketIO = new SocketIOServer();
  socketIO.start(serverConfig.socketIOServer.port as number);
}

startHTTPServer();
startSocketIOServer();