import { ethers } from 'ethers';
import { Network } from '../entities/Wallet';
export interface TransactionReceipt {
    hash: string;
    from: string;
    to: string;
    amount: string;
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    gasUsed?: string;
    gasPrice?: string;
    timestamp?: bigint;
}
/**
 * Service for interacting with blockchain APIs (Alchemy/Etherscan)
 */
export declare class BlockchainService {
    private alchemyProvider;
    private etherscanApiUrl;
    constructor(network?: Network);
    /**
     * Gets the balance of an address from the blockchain
     * @param address - The wallet address
     * @returns Balance in Wei as a string
     */
    getBalance(address: string): Promise<string>;
    /**
     * Gets the transaction count (nonce) for an address
     * @param address - The wallet address
     * @returns The transaction count
     */
    getTransactionCount(address: string): Promise<number>;
    /**
     * Gets the current gas price
     * @returns Gas price in Wei
     */
    getGasPrice(): Promise<bigint>;
    /**
     * Estimates gas limit for a transaction
     * @param transaction - The transaction request
     * @returns Estimated gas limit
     */
    estimateGas(transaction: ethers.TransactionRequest): Promise<bigint>;
    /**
     * Broadcasts a signed transaction to the blockchain
     * @param signedTx - The signed transaction in hex format
     * @returns Transaction hash
     */
    sendTransaction(signedTx: string): Promise<string>;
    /**
     * Gets transaction receipt to check confirmation status
     * @param txHash - Transaction hash
     * @returns Transaction receipt or null if not found
     */
    getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null>;
    /**
     * Gets transaction history for an address using Etherscan API
     * @param address - The wallet address
     * @param limit - Maximum number of transactions to return
     * @returns Array of transactions
     */
    getTransactionHistory(address: string, limit?: number): Promise<TransactionReceipt[]>;
    /**
     * Gets transaction history from Alchemy (fallback method)
     * Uses Alchemy's getAssetTransfers API via RPC
     * @param address - The wallet address
     * @param limit - Maximum number of transactions to return
     * @returns Array of transactions
     */
    private getTransactionHistoryFromAlchemy;
    /**
     * Waits for a transaction to be confirmed
     * @param txHash - Transaction hash
     * @param confirmations - Number of confirmations to wait for (default: 1)
     * @returns Transaction receipt
     */
    waitForTransaction(txHash: string, confirmations?: number): Promise<ethers.TransactionReceipt | null>;
}
//# sourceMappingURL=BlockchainService.d.ts.map