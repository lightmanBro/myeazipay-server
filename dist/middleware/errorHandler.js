export class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super(400, message, true);
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(401, message, true);
    }
}
export class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(403, message, true);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message, true);
    }
}
export class BlockchainError extends AppError {
    constructor(message) {
        super(500, message, true);
    }
}
/**
 * Global error handling middleware
 */
export function errorHandler(err, _req, res, _next) {
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