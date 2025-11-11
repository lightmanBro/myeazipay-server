import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, JWTPayload } from '../../src/utils/jwt';
import { appConfig } from '../../src/config/app';

jest.mock('jsonwebtoken');

describe('JWT Utility Functions', () => {
  const mockPayload: JWTPayload = { userId: 1, email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
    (appConfig.jwtSecret as string | undefined) = 'testsecret';
    (appConfig.jwtExpiresIn as string | undefined) = '1h';
  });

  describe('generateToken', () => {
    it('should generate a token using jwt.sign', () => {
      const mockToken = 'mock.jwt.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = generateToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        appConfig.jwtSecret,
        expect.objectContaining({ expiresIn: appConfig.jwtExpiresIn })
      );
      expect(token).toBe(mockToken);
    });

    it('should throw an error if jwtSecret is missing', () => {
      (appConfig.jwtSecret as any) = undefined;
      expect(() => generateToken(mockPayload)).toThrow('JWT_SECRET is not configured');
    });
  });

  describe('verifyToken', () => {
    it('should return decoded payload when token is valid', () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = verifyToken('valid.token');

      expect(jwt.verify).toHaveBeenCalledWith('valid.token', appConfig.jwtSecret);
      expect(result).toEqual(mockPayload);
    });

    it('should throw an error when token is invalid or expired', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });

      expect(() => verifyToken('bad.token')).toThrow('Invalid or expired token');
    });
  });
});
