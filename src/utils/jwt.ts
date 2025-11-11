import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app';

export interface JWTPayload {
  userId: number;
  email: string;
}

/**
 * Generates a JWT token
 * @param payload - The payload to encode
 * @returns JWT token
 */
export function generateToken(payload: JWTPayload): string {
  if (!appConfig.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, appConfig.jwtSecret, {
    expiresIn: appConfig.jwtExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Verifies a JWT token
 * @param token - The token to verify
 * @returns Decoded payload
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, appConfig.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

