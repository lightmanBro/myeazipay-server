import { UserResolver } from '../../src/resolvers/UserResolver';
import { AppDataSource } from '../../src/config/database';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../src/utils/jwt';
import { ValidationError, AuthenticationError } from '../../src/middleware/errorHandler';

jest.mock('../../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('bcryptjs');
jest.mock('../../src/utils/jwt');

describe('UserResolver', () => {
  let resolver: UserResolver;
  let mockRepo: any;

  beforeEach(() => {
    resolver = new UserResolver();

    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
    (bcrypt.hash as jest.Mock).mockImplementation(async (p: string) => `hashed-${p}`);
    (bcrypt.compare as jest.Mock).mockImplementation(async (p: string, h: string) => h === `hashed-${p}`);
    (generateToken as jest.Mock).mockImplementation(({ userId }) => `token-${userId}`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ValidationError for invalid email', async () => {
      await expect(resolver.register('invalid', 'password123')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for short password', async () => {
      await expect(resolver.register('test@example.com', '123')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if user exists', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });
      await expect(resolver.register('test@example.com', 'password123')).rejects.toThrow(ValidationError);
    });

    it('should register user successfully', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const user = { id: 1, email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() };
      mockRepo.create.mockReturnValue(user);
      mockRepo.save.mockResolvedValue(user);

      const result = await resolver.register('test@example.com', 'password123');
      expect(result.token).toBe('token-1');
      expect(result.user.email).toBe('test@example.com');
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw AuthenticationError if user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(resolver.login('test@example.com', 'password123')).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError if password invalid', async () => {
      const user = { id: 1, email: 'test@example.com', passwordHash: 'hashed-password123' };
      mockRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(resolver.login('test@example.com', 'wrongpassword')).rejects.toThrow(AuthenticationError);
    });

    it('should login successfully', async () => {
      const user = { id: 1, email: 'test@example.com', passwordHash: 'hashed-password123', createdAt: new Date(), updatedAt: new Date() };
      mockRepo.findOne.mockResolvedValue(user);

      const result = await resolver.login('test@example.com', 'password123');
      expect(result.token).toBe('token-1');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('me', () => {
    it('should throw AuthenticationError if user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(resolver.me({ user: { userId: 1, email: 'test@example.com' } })).rejects.toThrow(AuthenticationError);
    });

    it('should return user successfully', async () => {
      const dbUser = { 
        id: 1, 
        email: 'test@example.com', 
        wallets: [], 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      mockRepo.findOne.mockResolvedValue(dbUser);

      const result = await resolver.me({ user: { userId: 1, email: 'test@example.com' } });
      expect(result.id).toBe(1);
      expect(result.email).toBe('test@example.com');
    });
  });
});
