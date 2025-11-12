import { Transaction } from '../entities/Transaction';
import { Network } from '../entities/Wallet';
/**
 * Service for transaction operations
 */
export declare class TransactionService {
    private walletService;
    private blockchainService;
    constructor(network?: Network);
    /**
     * Sends funds from a wallet to another address
     * @param fromAddress - The sender wallet address
     * @param toAddress - The recipient address
     * @param amount - The amount in Ether (will be converted to Wei)
     * @param network - The network
     * @returns The transaction hash
     */
    sendFunds(fromAddress: string, toAddress: string, amount: string, network: Network): Promise<Transaction>;
    /**
     * Polls for transaction confirmation
     * @param txHash - Transaction hash
     * @param transactionId - Database transaction ID
     * @param userId - User ID for audit logging
     */
    private pollTransactionConfirmation;
    /**
     * Gets transaction by hash
     * @param hash - Transaction hash
     * @returns Transaction or null if not found
     */
    getTransactionByHash(hash: string): Promise<Transaction | null>;
    /**
     * Gets transaction history for a wallet
     * @param address - Wallet address
     * @param network - Network
     * @param limit - Maximum number of transactions
     * @returns Array of transactions
     */
    getTransactionHistory(address: string, network: Network, limit?: number): Promise<Transaction[]>;
}
//# sourceMappingURL=TransactionService.d.ts.map