"use strict";
exports.__esModule = true;
exports.RateLimit = void 0;
var response_payload_1 = require("../shared/response/response.payload");
var express_rate_limit_1 = require("express-rate-limit");
var handleRateLimit = function (req, res) {
    var _response = (0, response_payload_1.ResponseBase)(response_payload_1.ResponseStatus.LIMITREQUEST, 'Too many requests - try request again after 15 minutes');
    return res.status(429).json(_response);
};
var RateLimit = function (retryPerMinutes, maxRequest) {
    return (0, express_rate_limit_1.rateLimit)({
        windowMs: retryPerMinutes * 60 * 1000,
        max: maxRequest,
        standardHeaders: true,
        legacyHeaders: false,
        handler: function (req, res) { handleRateLimit(req, res); }
    });
};
exports.RateLimit = RateLimit;
