"use strict";
var _a;
exports.__esModule = true;
exports.authenticateToken = void 0;
var response_payload_1 = require("../shared/response/response.payload");
var jwt = require('jsonwebtoken');
var SECRETKEY = (_a = process.env.SECRETKEY) !== null && _a !== void 0 ? _a : '';
var authenticateToken = function (req, res, next) {
    var token = req.header('Authorization');
    if (!token) {
        return (0, response_payload_1.ResponseBase)(response_payload_1.ResponseStatus.FAILURE, 'Unauthorized', null);
    }
    jwt.verify(token, SECRETKEY, function (err, user) {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
