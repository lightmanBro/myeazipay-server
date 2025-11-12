export interface JWTPayload {
    userId: number;
    email: string;
}
/**
 * Generates a JWT token
 * @param payload - The payload to encode
 * @returns JWT token
 */
export declare function generateToken(payload: JWTPayload): string;
/**
 * Verifies a JWT token
 * @param token - The token to verify
 * @returns Decoded payload
 */
export declare function verifyToken(token: string): JWTPayload;
//# sourceMappingURL=jwt.d.ts.map