// Test setup file
import 'reflect-metadata';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long!!';
process.env.ALCHEMY_API_KEY = 'test-alchemy-key';
process.env.DB_NAME = 'myeazipay_wallet_db';

