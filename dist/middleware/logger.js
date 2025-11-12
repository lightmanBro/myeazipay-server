/**
 * Simple request logging middleware
 * In production, you might want to use a proper logging library like Winston or Pino
 */
export function loggerMiddleware(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
        if (res.statusCode >= 400) {
            console.error(logMessage);
        }
        else {
            console.log(logMessage);
        }
    });
    next();
}
//# sourceMappingURL=logger.js.map