"use strict";
exports.__esModule = true;
exports.validatePassword = exports.validateUsername = exports.validateEmail = exports.ValidateImputUser = void 0;
var validator_1 = require("validator");
var ValidateImputUser = /** @class */ (function () {
    function ValidateImputUser() {
    }
    return ValidateImputUser;
}());
exports.ValidateImputUser = ValidateImputUser;
function validateEmail(email) {
    return validator_1["default"].isEmail(email);
}
exports.validateEmail = validateEmail;
function validateUsername(username) {
    var usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}
exports.validateUsername = validateUsername;
function validatePassword(password) {
    var minLength = 8;
    var hasUppercase = /[A-Z]/.test(password);
    var hasLowercase = /[a-z]/.test(password);
    var hasDigit = /\d/.test(password);
    var hasSpecialChar = /[!@#$%^&*()-=_+[\]{};':"\\|,.<>?]/.test(password);
    return (password.length >= minLength &&
        hasUppercase &&
        hasLowercase &&
        hasDigit &&
        hasSpecialChar);
}
exports.validatePassword = validatePassword;
