"use strict";
exports.__esModule = true;
exports.ResponseBase = exports.Version = exports.ResponseStatus = void 0;
var uuid_1 = require("uuid");
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus["SUCCESS"] = "SUCCESS";
    ResponseStatus["FAILURE"] = "FAILURE";
    ResponseStatus["CREATED"] = "CREATED";
    ResponseStatus["ERROR"] = "ERROR";
    ResponseStatus["TIMEOUT"] = "TIMEOUT";
    ResponseStatus["WRONG_FORMAT"] = "WRONG_FORMAT";
    ResponseStatus["NO_PERMISSIONS"] = "NO_PERMISSIONS";
    ResponseStatus["UNAUTHORIZE"] = "UNAUTHORIZE";
    ResponseStatus["FORBIDDENT"] = "FORBIDDENT";
    ResponseStatus["LIMITREQUEST"] = "LIMITREQUEST";
    ResponseStatus["NOT_FOUND"] = "NOT_FOUND";
})(ResponseStatus = exports.ResponseStatus || (exports.ResponseStatus = {}));
var Version;
(function (Version) {
    Version["V1"] = "v0.0.1";
})(Version = exports.Version || (exports.Version = {}));
var ResponseBase = function (status, message, data) {
    var _response = {
        id: (0, uuid_1.v4)(),
        timestamp: Date.now().toString(),
        apiVersion: Version.V1,
        status: status,
        message: message,
        data: data
    };
    return _response;
};
exports.ResponseBase = ResponseBase;
