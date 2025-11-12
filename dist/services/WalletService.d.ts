import { Wallet, Network } from '../entities/Wallet';
/**
 * Service for wallet operations
 */
export declare class WalletService {
    private encryptionService;
    constructor(_network?: Network);
    /**
     * Creates a new wallet for a user
     * @param userId - The user ID
     * @param network - The network (testnet/mainnet)
     * @returns The created wallet (without private key)
     */
    createWallet(userId: number, network?: Network): Promise<Wallet>;
    /**
     * Gets wallet by address
     * @param address - The wallet address
     * @param userId - The user ID (optional, for authorization)
     * @returns The wallet or null if not found
     */
    getWalletByAddress(address: string, userId?: number): Promise<Wallet | null>;
    /**
     * Gets all wallets for a user
     * @param userId - The user ID
     * @returns Array of wallets
     */
    getUserWallets(userId: number): Promise<Wallet[]>;
    /**
     * Gets wallet balance from blockchain
     * @param address - The wallet address
     * @param network - The network
     * @returns Balance in Wei and Ether
     */
    getBalance(address: string, network: Network): Promise<{
        balance: string;
        balanceInWei: string;
    }>;
    /**
     * Gets the private key for a wallet (decrypted)
     * WARNING: This should only be used internally for transaction signing
     * @param walletId - The wallet ID
     * @param userId - The user ID (for authorization)
     * @returns The decrypted private key
     */
    getPrivateKey(walletId: number, userId: number): Promise<string>;
    /**
     * Gets the private key for a wallet by address
     * WARNING: This should only be used internally for transaction signing
     * @param address - The wallet address
     * @returns The decrypted private key
     */
    getPrivateKeyByAddress(address: string): Promise<string>;
}
//# sourceMappingURL=WalletService.d.ts.map