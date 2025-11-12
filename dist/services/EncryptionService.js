import crypto from 'crypto';
import { appConfig } from '../config/app';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
/**
 * Service for encrypting and decrypting private keys
 * Uses AES-256-GCM for authenticated encryption
 */
export class EncryptionService {
    constructor() {
        const key = appConfig.encryptionKey;
        if (!key || key.length < 32) {
            throw new Error('ENCRYPTION_KEY must be at least 32 bytes long');
        }
        // Use first 32 bytes of the key
        this.encryptionKey = Buffer.from(key.slice(0, 32), 'utf8');
    }
    /**
     * Encrypts a private key using AES-256-GCM
     * @param privateKey - The private key to encrypt
     * @returns Encrypted string in format: iv:salt:tag:encryptedData
     */
    encrypt(privateKey) {
        if (!privateKey || typeof privateKey !== 'string') {
            throw new Error('Private key must be a non-empty string');
        }
        // Generate random IV and salt
        const iv = crypto.randomBytes(IV_LENGTH);
        const salt = crypto.randomBytes(SALT_LENGTH);
        // Derive key from encryption key and salt
        const key = crypto.pbkdf2Sync(this.encryptionKey, salt, 100000, KEY_LENGTH, 'sha256');
        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        // Encrypt the private key
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Get authentication tag
        const tag = cipher.getAuthTag();
        // Return format: iv:salt:tag:encryptedData
        return `${iv.toString('hex')}:${salt.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    }
    /**
     * Decrypts an encrypted private key
     * @param encryptedData - The encrypted string in format: iv:salt:tag:encryptedData
     * @returns The decrypted private key
     */
    decrypt(encryptedData) {
        if (!encryptedData || typeof encryptedData !== 'string') {
            throw new Error('Encrypted data must be a non-empty string');
        }
        try {
            // Parse the encrypted data
            const parts = encryptedData.split(':');
            if (parts.length !== 4) {
                throw new Error('Invalid encrypted data format');
            }
            const [ivHex, saltHex, tagHex, encrypted] = parts;
            const iv = Buffer.from(ivHex, 'hex');
            const salt = Buffer.from(saltHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            // Derive key from encryption key and salt
            const key = crypto.pbkdf2Sync(this.encryptionKey, salt, 100000, KEY_LENGTH, 'sha256');
            // Create decipher
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(tag);
            // Decrypt the private key
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new Error(`Failed to decrypt private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
//# sourceMappingURL=EncryptionService.js.map