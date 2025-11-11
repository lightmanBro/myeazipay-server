import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BlockchainError,
  errorHandler,
} from '../../src/middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

describe('AppError hierarchy', () => {
  it('should correctly instantiate ValidationError', () => {
    const err = new ValidationError('Invalid data');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid data');
    expect(err.isOperational).toBe(true);
  });

  it('should correctly instantiate AuthenticationError', () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Authentication failed');
  });

  it('should correctly instantiate AuthorizationError', () => {
    const err = new AuthorizationError('Forbidden');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
  });

  it('should correctly instantiate NotFoundError', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Resource not found');
  });

  it('should correctly instantiate BlockchainError', () => {
    const err = new BlockchainError('Blockchain failure');
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe('Blockchain failure');
  });
});

describe('errorHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should handle known AppError correctly', () => {
    const err = new ValidationError('Bad request');
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Bad request',
      statusCode: 400,
    });
  });

  it('should handle unknown error as 500', () => {
    const err = new Error('Unknown failure');
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error',
        statusCode: 500,
      })
    );
  });
});
