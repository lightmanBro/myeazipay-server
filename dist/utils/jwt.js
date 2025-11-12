"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../config/app");
/**
 * Generates a JWT token
 * @param payload - The payload to encode
 * @returns JWT token
 */
function generateToken(payload) {
    if (!app_1.appConfig.jwtSecret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jsonwebtoken_1.default.sign(payload, app_1.appConfig.jwtSecret, {
        expiresIn: app_1.appConfig.jwtExpiresIn,
    });
}
/**
 * Verifies a JWT token
 * @param token - The token to verify
 * @returns Decoded payload
 */
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, app_1.appConfig.jwtSecret);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
}
//# sourceMappingURL=jwt.js.map