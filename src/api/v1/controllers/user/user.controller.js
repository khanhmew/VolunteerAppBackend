"use strict";
exports.__esModule = true;
exports.UserController = void 0;
var user_service_1 = require("../../services/user.service");
var UserController = /** @class */ (function () {
    function UserController() {
        var _this = this;
        this.saveUserCallback = function (req, res, next) {
            try {
                var user = req.body;
                if (!user) {
                    res.status(400).json({ message: 'Invalid request body' });
                    return;
                }
                var saveUserResponse = _this.userServiceInstance.save(user);
                res.status(201).json(saveUserResponse);
            }
            catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Error' });
            }
        };
        this.getAll = function (req, res, next) {
            var saveUserResponse = _this.userServiceInstance.save(1);
            return res.status(200).json(saveUserResponse);
        };
        this.userServiceInstance = new user_service_1.UserService();
    }
    return UserController;
}());
exports.UserController = UserController;
