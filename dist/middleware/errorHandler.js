"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
exports.errorHandler = errorHandler;
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(400, message, true);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(401, message, true);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(403, message, true);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message, true);
    }
}
exports.NotFoundError = NotFoundError;
class BlockchainError extends AppError {
    constructor(message) {
        super(500, message, true);
    }
}
exports.BlockchainError = BlockchainError;
/**
 * Global error handling middleware
 */
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            statusCode: err.statusCode,
        });
        return;
    }
    // Log unexpected errors
    console.error('Unexpected error:', err);
    res.status(500).json({
        error: 'Internal server error',
        statusCode: 500,
        ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    });
}
//# sourceMappingURL=errorHandler.js.map