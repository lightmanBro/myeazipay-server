import { EncryptionService } from '../../src/services/EncryptionService';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    // Use a test encryption key
    process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long!!';
    encryptionService = new EncryptionService();
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  describe('encrypt', () => {
    it('should encrypt a private key', () => {
      const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const encrypted = encryptionService.encrypt(privateKey);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(privateKey);
      expect(encrypted.split(':')).toHaveLength(4); // iv:salt:tag:encryptedData
    });

    it('should throw error for invalid input', () => {
      expect(() => encryptionService.encrypt('')).toThrow();
      expect(() => encryptionService.encrypt(null as any)).toThrow();
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted private key', () => {
      const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const encrypted = encryptionService.encrypt(privateKey);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(privateKey);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => encryptionService.decrypt('invalid')).toThrow();
      expect(() => encryptionService.decrypt('')).toThrow();
    });
  });
});

