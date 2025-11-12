"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const ethers_1 = require("ethers");
const database_1 = require("../config/database");
const Wallet_1 = require("../entities/Wallet");
const EncryptionService_1 = require("./EncryptionService");
const BlockchainService_1 = require("./BlockchainService");
const AuditLogService_1 = require("./AuditLogService");
const AuditLog_1 = require("../entities/AuditLog");
const addressValidation_1 = require("../utils/addressValidation");
const blockchain_1 = require("../config/blockchain");
/**
 * Service for wallet operations
 */
class WalletService {
    constructor(_network = Wallet_1.Network.TESTNET) {
        this.encryptionService = new EncryptionService_1.EncryptionService();
    }
    /**
     * Creates a new wallet for a user
     * @param userId - The user ID
     * @param network - The network (testnet/mainnet)
     * @returns The created wallet (without private key)
     */
    async createWallet(userId, network = Wallet_1.Network.TESTNET) {
        try {
            // Enforce testnet if configured
            if (blockchain_1.blockchainConfig.enforceTestnet && network === Wallet_1.Network.MAINNET) {
                const error = 'Mainnet transactions are not allowed. Please use testnet.';
                console.error('[WALLET ERROR]', { error, userId, network });
                throw new Error(error);
            }
            console.log('[WALLET INFO] Creating new wallet:', { userId, network });
            // Generate new wallet using ethers.js
            const wallet = ethers_1.ethers.Wallet.createRandom();
            const address = wallet.address;
            const privateKey = wallet.privateKey;
            // Encrypt the private key
            const encryptedPrivateKey = this.encryptionService.encrypt(privateKey);
            // Clear private key from memory
            // Note: In a real application, you might want to use secure memory clearing
            // Save wallet to database
            const walletRepository = database_1.AppDataSource.getRepository(Wallet_1.Wallet);
            const newWallet = await walletRepository.create({
                address,
                privateKeyEncrypted: encryptedPrivateKey,
                network,
                userId,
            });
            const savedWallet = await walletRepository.save(newWallet);
            // console.log('[WALLET SUCCESS] Wallet created:', { address, userId, network });
            // Log wallet creation
            await AuditLogService_1.AuditLogService.logSuccess(AuditLog_1.AuditAction.WALLET_CREATE, {
                userId,
                walletAddress: address,
                metadata: { network },
            });
            // Return wallet without private key
            return savedWallet;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[WALLET ERROR] Failed to create wallet:', {
                error: errorMessage,
                userId,
                network,
            });
            // Log failure
            await AuditLogService_1.AuditLogService.logFailure(AuditLog_1.AuditAction.WALLET_CREATE, errorMessage, {
                userId,
                metadata: { network },
            });
            throw error;
        }
    }
    /**
     * Gets wallet by address
     * @param address - The wallet address
     * @param userId - The user ID (optional, for authorization)
     * @returns The wallet or null if not found
     */
    async getWalletByAddress(address, userId) {
        const normalizedAddress = (0, addressValidation_1.validateAndNormalizeAddress)(address);
        const walletRepository = database_1.AppDataSource.getRepository(Wallet_1.Wallet);
        const where = { address: normalizedAddress };
        if (userId) {
            where.userId = userId;
        }
        return walletRepository.findOne({ where, relations: ['user'] });
    }
    /**
     * Gets all wallets for a user
     * @param userId - The user ID
     * @returns Array of wallets
     */
    async getUserWallets(userId) {
        const walletRepository = database_1.AppDataSource.getRepository(Wallet_1.Wallet);
        return walletRepository.find({
            where: { userId },
            relations: ['transactions'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Gets wallet balance from blockchain
     * @param address - The wallet address
     * @param network - The network
     * @returns Balance in Wei and Ether
     */
    async getBalance(address, network) {
        try {
            const normalizedAddress = (0, addressValidation_1.validateAndNormalizeAddress)(address);
            const blockchainService = new BlockchainService_1.BlockchainService(network);
            const balanceInWei = await blockchainService.getBalance(normalizedAddress);
            const balance = ethers_1.ethers.formatEther(balanceInWei);
            console.log('[WALLET INFO] Balance retrieved:', {
                address: normalizedAddress,
                balance,
                network,
            });
            return {
                balance,
                balanceInWei,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[WALLET ERROR] Failed to get balance:', {
                error: errorMessage,
                address,
                network,
            });
            throw error;
        }
    }
    /**
     * Gets the private key for a wallet (decrypted)
     * WARNING: This should only be used internally for transaction signing
     * @param walletId - The wallet ID
     * @param userId - The user ID (for authorization)
     * @returns The decrypted private key
     */
    async getPrivateKey(walletId, userId) {
        const walletRepository = database_1.AppDataSource.getRepository(Wallet_1.Wallet);
        const wallet = await walletRepository.findOne({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new Error('Wallet not found or access denied');
        }
        // Decrypt the private key
        return this.encryptionService.decrypt(wallet.privateKeyEncrypted);
    }
    /**
     * Gets the private key for a wallet by address
     * WARNING: This should only be used internally for transaction signing
     * @param address - The wallet address
     * @returns The decrypted private key
     */
    async getPrivateKeyByAddress(address) {
        const normalizedAddress = (0, addressValidation_1.validateAndNormalizeAddress)(address);
        const wallet = await this.getWalletByAddress(normalizedAddress);
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        // Decrypt the private key
        return this.encryptionService.decrypt(wallet.privateKeyEncrypted);
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=WalletService.js.map