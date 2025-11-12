import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}
/**
 * Authentication middleware for Express
 * Extracts and verifies JWT token from Authorization header
 */
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map