"use strict";
exports.__esModule = true;
exports.UserDomainModel = void 0;
var UserDomainModel = /** @class */ (function () {
    function UserDomainModel() {
        this.save = function (data) {
            return null;
        };
        this.formatUsername = function (username) {
            // Bussiness logic
            return "bussiness-rule-".concat(username);
        };
    }
    return UserDomainModel;
}());
exports.UserDomainModel = UserDomainModel;
