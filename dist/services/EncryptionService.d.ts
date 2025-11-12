/**
 * Service for encrypting and decrypting private keys
 * Uses AES-256-GCM for authenticated encryption
 */
export declare class EncryptionService {
    private encryptionKey;
    constructor();
    /**
     * Encrypts a private key using AES-256-GCM
     * @param privateKey - The private key to encrypt
     * @returns Encrypted string in format: iv:salt:tag:encryptedData
     */
    encrypt(privateKey: string): string;
    /**
     * Decrypts an encrypted private key
     * @param encryptedData - The encrypted string in format: iv:salt:tag:encryptedData
     * @returns The decrypted private key
     */
    decrypt(encryptedData: string): string;
}
//# sourceMappingURL=EncryptionService.d.ts.map