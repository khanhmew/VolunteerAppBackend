"use strict";
var _a, _b, _c, _d, _e;
exports.__esModule = true;
exports.serverConfig = void 0;
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
var MONGODB_USERNAME = (_a = process.env.MONGODB_USERNAME) !== null && _a !== void 0 ? _a : '';
var MONGODB_PASSWORD = (_b = process.env.MONGODB_PASSWORD) !== null && _b !== void 0 ? _b : '';
var MONGODB_DATABASE_NAME = (_c = process.env.MONGODB_DATABASE_NAME) !== null && _c !== void 0 ? _c : '';
var MONGODB_URL = "mongodb+srv://\n".concat(MONGODB_USERNAME, ":").concat(MONGODB_PASSWORD, "\n@cluster0.imlcljm.mongodb.net/").concat(MONGODB_DATABASE_NAME);
var SERVER_PORT = (_d = process.env.HTTP_SERVER_PORT) !== null && _d !== void 0 ? _d : 3000;
var SOCKET_IO_SERVER_PORT = (_e = process.env.SOCKET_IO_SERVER_PORT) !== null && _e !== void 0 ? _e : 3200;
var API_PATH = process.env.API_PATH ? process.env.API_PATH : '/api/v1';
var MAIL_USERNAME = process.env.MAIL_SERVER_USERNAME;
var MAIL_PASSWORD = process.env.MAIL_SERVER_PASSWORD;
exports.serverConfig = {
    mongo: {
        url: MONGODB_URL
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
};
