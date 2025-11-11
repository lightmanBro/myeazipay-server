import { loggerMiddleware } from '../../src/middleware/logger';
import { Request, Response, NextFunction } from 'express';

describe('loggerMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { method: 'GET', path: '/test' };
    res = {
      statusCode: 200,
      on: jest.fn().mockImplementation((event: string, handler: () => void) => {
        if (event === 'finish') {
          handler(); // call immediately
        }
        return res; // important: return 'this' to satisfy typings
      }),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should log successful requests', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    loggerMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/test 200 \d+ms/)
    );
  });

  it('should log error requests (statusCode >= 400)', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    res.statusCode = 404;
    loggerMiddleware(req as Request, res as Response, next);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/test 404 \d+ms/)
    );
  });
});
