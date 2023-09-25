"use strict";
exports.__esModule = true;
exports.SocketIOServer = void 0;
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var SocketIOServer = /** @class */ (function () {
    function SocketIOServer() {
        this.start = function (port) {
            var httpServer = (0, http_1.createServer)();
            var io = new socket_io_1.Server(httpServer, {
            // ...
            });
            io.on("connection", function (socket) {
                // ...
            });
            httpServer.listen(port, function () {
                console.log("\u26A1\uFE0F [io]: Socket IO server running at: http://localhost:".concat(port));
            });
        };
    }
    return SocketIOServer;
}());
exports.SocketIOServer = SocketIOServer;
