import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app';
/**
 * Generates a JWT token
 * @param payload - The payload to encode
 * @returns JWT token
 */
export function generateToken(payload) {
    if (!appConfig.jwtSecret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign(payload, appConfig.jwtSecret, {
        expiresIn: appConfig.jwtExpiresIn,
    });
}
/**
 * Verifies a JWT token
 * @param token - The token to verify
 * @returns Decoded payload
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, appConfig.jwtSecret);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
}
//# sourceMappingURL=jwt.js.map