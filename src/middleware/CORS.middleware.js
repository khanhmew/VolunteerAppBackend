"use strict";
exports.__esModule = true;
exports.CORSMiddleware = void 0;
var CORSMiddleware = function (req, res, NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE, GET');
        return res.status(200).json({});
    }
    NextFunction();
};
exports.CORSMiddleware = CORSMiddleware;
