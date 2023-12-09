import dotenv from 'dotenv';

dotenv.config();

const MONGODB_USERNAME = process.env.MONGODB_USERNAME ?? '';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD ?? '';
const MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME ?? '';

const POSTGRE_HOST = process.env.POSTGRE_HOST ?? '';
const POSTGRE_PORT = process.env.POSTGRE_PORT ?? '';
const POSTGRE_DATABASE_NAME = process.env.POSTGRE_DATABASE_NAME ?? '';
const POSTGRE_USERNAME = process.env.POSTGRE_USERNAME ?? '';
const POSTGRE_PASSWORD = process.env.POSTGRE_PASSWORD ?? '';


const REDIS_PORT = process.env.REDIS_PORT ?? '';
const REDIS_HOST = process.env.REDIS_HOST ?? '';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? '';

const MONGODB_URL = `mongodb+srv://
${MONGODB_USERNAME}:${MONGODB_PASSWORD}
@cluster0.imlcljm.mongodb.net/${MONGODB_DATABASE_NAME}`;

const SERVER_PORT = process.env.HTTP_SERVER_PORT ?? 3000;
const SOCKET_IO_SERVER_PORT = process.env.SOCKET_IO_SERVER_PORT ?? 3200;

const API_PATH = process.env.API_PATH ? process.env.API_PATH : '/api/v1';

const MAIL_USERNAME = process.env.MAIL_SERVER_USERNAME;
const MAIL_PASSWORD = process.env.MAIL_SERVER_PASSWORD;

export const serverConfig = {
  mongo: {
    url: MONGODB_URL
  },
  postgre:{
    user: POSTGRE_USERNAME,
    password:POSTGRE_PASSWORD,
    host: POSTGRE_HOST, 
    port: 5432, 
    database: POSTGRE_DATABASE_NAME,
  },
  redis: {
    port: REDIS_PORT,
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    connectTimeout: 10000
  },
  server: {
    port: SERVER_PORT
  }, 
  socketIOServer: {
    port: SOCKET_IO_SERVER_PORT
  },
  api: {
    path: API_PATH
  },
  mailServer: {
    username: MAIL_USERNAME,
    password: MAIL_PASSWORD
  }
}