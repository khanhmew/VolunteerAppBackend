"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.EmailFormatError = exports.PasswordFormatError = exports.UsernameExistError = exports.WrongPasswordError = exports.AccountNotFoundError = void 0;
var AccountNotFoundError = /** @class */ (function (_super) {
    __extends(AccountNotFoundError, _super);
    function AccountNotFoundError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "AccountNotFoundError";
        Object.setPrototypeOf(_this, AccountNotFoundError.prototype);
        return _this;
    }
    return AccountNotFoundError;
}(Error));
exports.AccountNotFoundError = AccountNotFoundError;
var WrongPasswordError = /** @class */ (function (_super) {
    __extends(WrongPasswordError, _super);
    function WrongPasswordError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "WrongPasswordError";
        Object.setPrototypeOf(_this, WrongPasswordError.prototype);
        return _this;
    }
    return WrongPasswordError;
}(Error));
exports.WrongPasswordError = WrongPasswordError;
var UsernameExistError = /** @class */ (function (_super) {
    __extends(UsernameExistError, _super);
    function UsernameExistError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "UsernameExistError";
        Object.setPrototypeOf(_this, UsernameExistError.prototype);
        return _this;
    }
    return UsernameExistError;
}(Error));
exports.UsernameExistError = UsernameExistError;
var PasswordFormatError = /** @class */ (function (_super) {
    __extends(PasswordFormatError, _super);
    function PasswordFormatError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "PasswordFormatError";
        Object.setPrototypeOf(_this, PasswordFormatError.prototype);
        return _this;
    }
    return PasswordFormatError;
}(Error));
exports.PasswordFormatError = PasswordFormatError;
var EmailFormatError = /** @class */ (function (_super) {
    __extends(EmailFormatError, _super);
    function EmailFormatError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "EmailFormatError";
        Object.setPrototypeOf(_this, EmailFormatError.prototype);
        return _this;
    }
    return EmailFormatError;
}(Error));
exports.EmailFormatError = EmailFormatError;
