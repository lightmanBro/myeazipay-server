import { ethers } from 'ethers';
import { AppDataSource } from '../config/database';
import { Wallet, Network } from '../entities/Wallet';
import { EncryptionService } from './EncryptionService';
import { BlockchainService } from './BlockchainService';
import { AuditLogService } from './AuditLogService';
import { AuditAction } from '../entities/AuditLog';
import { validateAndNormalizeAddress } from '../utils/addressValidation';
import { blockchainConfig } from '../config/blockchain';

/**
 * Service for wallet operations
 */
export class WalletService {
  private encryptionService: EncryptionService;

  constructor(_network: Network = Network.TESTNET) {
    this.encryptionService = new EncryptionService();
  }

  /**
   * Creates a new wallet for a user
   * @param userId - The user ID
   * @param network - The network (testnet/mainnet)
   * @returns The created wallet (without private key)
   */
  async createWallet(userId: number, network: Network = Network.TESTNET): Promise<Wallet> {
    try {
      // Enforce testnet if configured
      if (blockchainConfig.enforceTestnet && network === Network.MAINNET) {
        const error = 'Mainnet transactions are not allowed. Please use testnet.';
        console.error('[WALLET ERROR]', { error, userId, network });
        throw new Error(error);
      }

      console.log('[WALLET INFO] Creating new wallet:', { userId, network });

      // Generate new wallet using ethers.js
      const wallet = ethers.Wallet.createRandom();
      const address = wallet.address;
      const privateKey = wallet.privateKey;

      // Encrypt the private key
      const encryptedPrivateKey = this.encryptionService.encrypt(privateKey);

      // Clear private key from memory
      // Note: In a real application, you might want to use secure memory clearing

      // Save wallet to database
      const walletRepository = AppDataSource.getRepository(Wallet);
      const newWallet = await walletRepository.create({
        address,
        privateKeyEncrypted: encryptedPrivateKey,
        network,
        userId,
      });

      const savedWallet = await walletRepository.save(newWallet);

      // console.log('[WALLET SUCCESS] Wallet created:', { address, userId, network });

      // Log wallet creation
      await AuditLogService.logSuccess(AuditAction.WALLET_CREATE, {
        userId,
        walletAddress: address,
        metadata: { network },
      });

      // Return wallet without private key
      return savedWallet;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[WALLET ERROR] Failed to create wallet:', {
        error: errorMessage,
        userId,
        network,
      });

      // Log failure
      await AuditLogService.logFailure(
        AuditAction.WALLET_CREATE,
        errorMessage,
        {
          userId,
          metadata: { network },
        }
      );

      throw error;
    }
  }

  /**
   * Gets wallet by address
   * @param address - The wallet address
   * @param userId - The user ID (optional, for authorization)
   * @returns The wallet or null if not found
   */
  async getWalletByAddress(address: string, userId?: number): Promise<Wallet | null> {
    const normalizedAddress = validateAndNormalizeAddress(address);
    const walletRepository = AppDataSource.getRepository(Wallet);

    const where: any = { address: normalizedAddress };
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
  async getUserWallets(userId: number): Promise<Wallet[]> {
    const walletRepository = AppDataSource.getRepository(Wallet);
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
  async getBalance(address: string, network: Network): Promise<{ balance: string; balanceInWei: string }> {
    try {
      const normalizedAddress = validateAndNormalizeAddress(address);
      const blockchainService = new BlockchainService(network);
      const balanceInWei = await blockchainService.getBalance(normalizedAddress);
      const balance = ethers.formatEther(balanceInWei);

      console.log('[WALLET INFO] Balance retrieved:', {
        address: normalizedAddress,
        balance,
        network,
      });

      return {
        balance,
        balanceInWei,
      };
    } catch (error) {
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
  async getPrivateKey(walletId: number, userId: number): Promise<string> {
    const walletRepository = AppDataSource.getRepository(Wallet);
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
  async getPrivateKeyByAddress(address: string): Promise<string> {
    const normalizedAddress = validateAndNormalizeAddress(address);
    const wallet = await this.getWalletByAddress(normalizedAddress);

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Decrypt the private key
    return this.encryptionService.decrypt(wallet.privateKeyEncrypted);
  }
}

