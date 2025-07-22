"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // Maintains proper stack trace (only in V8 environments like Node.js)
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ErrorHandler;
