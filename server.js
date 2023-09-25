"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.routes = void 0;
// Import dependencies && init serverlication express
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var server_config_1 = require("./src/config/server.config");
var mongoose_1 = require("mongoose");
var user_route_1 = require("./src/api/v1/routes/user.route");
var auth_route_1 = require("./src/api/v1/routes/auth.route");
var axios_1 = require("axios");
var CORS_middleware_1 = require("./src/middleware/CORS.middleware");
var socket_io_server_1 = require("./src/socket/v1/socket-io.server");
var server = (0, express_1["default"])();
exports.routes = express_1["default"].Router();
// compress response
var compression = require("compression");
server.use(compression());
// Secure our api
var helmet = require("helmet");
server.use(helmet());
// Use morgan
var morgan = require('morgan');
server.use(morgan('combined'));
// Connect to mongodb
console.info(' ↻ [server]: Waitting for connect to mongodb ...');
mongoose_1["default"].set('strictQuery', true);
mongoose_1["default"]
    .connect(server_config_1.serverConfig.mongo.url, { retryWrites: true, w: 'majority' })
    .then(function () {
    console.info('✅ [server]: Connected to mongodb');
})["catch"](function (err) {
    console.error(err);
});
// Start server
var startHTTPServer = function () {
    // Configure request size
    server.use(body_parser_1["default"].json({ limit: '50mb', type: 'application/json' }));
    server.use(body_parser_1["default"].urlencoded({ limit: '50mb', extended: true }));
    // Configure routes
    server.use(CORS_middleware_1.CORSMiddleware);
    server.use(server_config_1.serverConfig.api.path, exports.routes);
    exports.routes.use(user_route_1["default"]);
    exports.routes.use(auth_route_1["default"]);
    // server.use('',  (req: Request, res: Response, next: NextFunction) => {
    //   return res.status(200).json(ResponseBase(ResponseStatus.SUCCESS, 'I need U'));
    // })
    var port = server_config_1.serverConfig.server.port;
    server.listen(port, function () {
        console.log("\u26A1\uFE0F [server]: Server is running at: http://localhost:".concat(port));
    });
    function getIP() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1["default"].get('https://api.ipify.org').then(function (response) {
                            console.log("[server] IP: ".concat(response.data));
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    getIP();
};
var startSocketIOServer = function () {
    var socketIO = new socket_io_server_1.SocketIOServer();
    socketIO.start(server_config_1.serverConfig.socketIOServer.port);
};
startHTTPServer();
startSocketIOServer();
