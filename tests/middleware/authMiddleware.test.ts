import { authMiddleware, AuthRequest } from '../../src/middleware/auth';
import { verifyToken } from '../../src/utils/jwt';
import { Response, NextFunction } from 'express';

jest.mock('../../src/utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

describe('authMiddleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should return 401 if no Authorization header is provided', () => {
    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    mockReq.headers = { authorization: 'Bearer invalidtoken' };

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('should attach user to req and call next if token is valid', () => {
    (verifyToken as jest.Mock).mockReturnValue({ userId: 1, email: 'test@example.com' });

    mockReq.headers = { authorization: 'Bearer validtoken' };

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual({ userId: 1, email: 'test@example.com' });
    expect(mockNext).toHaveBeenCalled();
  });
});
