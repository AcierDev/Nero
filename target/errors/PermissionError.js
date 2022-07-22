"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionError = void 0;
class PermissionError {
    _message;
    constructor(options) {
        this.message = options.message;
    }
    get message() {
        return this._message;
    }
    set message(message) {
        this._message = message;
    }
}
exports.PermissionError = PermissionError;
