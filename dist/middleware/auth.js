import { verifyToken } from '../utils/jwt';
/**
 * Authentication middleware for Express
 * Extracts and verifies JWT token from Authorization header
 */
export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const payload = verifyToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({ error: error instanceof Error ? error.message : 'Invalid token' });
    }
}
//# sourceMappingURL=auth.js.map