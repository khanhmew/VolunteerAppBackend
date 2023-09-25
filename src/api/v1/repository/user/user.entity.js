"use strict";
exports.__esModule = true;
exports.DefaultUserData = void 0;
var mongoose_1 = require("mongoose");
var IUserSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    fullname: { type: String, required: true },
    avatar: { type: String, required: false },
    email: { type: String, required: true, unique: false },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    initTime: { type: Date, required: true },
    isActiveOrganization: { type: Boolean, required: false },
    imageAuthenticate: { type: String, required: false }
}, {
    versionKey: false
});
exports["default"] = mongoose_1["default"].model('User', IUserSchema);
var DefaultUserData = function (type, email, fullname, username, passwordHash, phone) {
    var iUser = {
        type: type,
        email: email,
        fullname: fullname,
        username: username,
        phone: phone,
        avatar: '',
        initTime: new Date(),
        password: passwordHash,
        isActiveOrganization: false,
        imageAuthenticate: ''
    };
    return iUser;
};
exports.DefaultUserData = DefaultUserData;
