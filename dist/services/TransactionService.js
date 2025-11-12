"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const ethers_1 = require("ethers");
const database_1 = require("../config/database");
const Transaction_1 = require("../entities/Transaction");
const Wallet_1 = require("../entities/Wallet");
const BlockchainService_1 = require("./BlockchainService");
const WalletService_1 = require("./WalletService");
const AuditLogService_1 = require("./AuditLogService");
const AuditLog_1 = require("../entities/AuditLog");
const addressValidation_1 = require("../utils/addressValidation");
const blockchain_1 = require("../config/blockchain");
/**
 * Service for transaction operations
 */
class TransactionService {
    constructor(network = Wallet_1.Network.TESTNET) {
        this.walletService = new WalletService_1.WalletService(network);
        this.blockchainService = new BlockchainService_1.BlockchainService(network);
    }
    /**
     * Sends funds from a wallet to another address
     * @param fromAddress - The sender wallet address
     * @param toAddress - The recipient address
     * @param amount - The amount in Ether (will be converted to Wei)
     * @param network - The network
     * @returns The transaction hash
     */
    async sendFunds(fromAddress, toAddress, amount, network) {
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let normalizedFromAddress = '';
        let normalizedToAddress = '';
        let txHash;
        let wallet;
        try {
            // Enforce testnet if configured
            if (blockchain_1.blockchainConfig.enforceTestnet && network === Wallet_1.Network.MAINNET) {
                const error = 'Mainnet transactions are not allowed. Please use testnet.';
                console.error('[TRANSACTION ERROR]', { error, network, fromAddress });
                throw new Error(error);
            }
            // Validate addresses
            try {
                normalizedFromAddress = (0, addressValidation_1.validateAndNormalizeAddress)(fromAddress);
                normalizedToAddress = (0, addressValidation_1.validateAndNormalizeAddress)(toAddress);
            }
            catch (error) {
                const errorMsg = `Address validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
                console.error('[TRANSACTION ERROR]', { error: errorMsg, fromAddress, toAddress });
                throw new Error(errorMsg);
            }
            // Validate amount
            const amountInEther = parseFloat(amount);
            if (isNaN(amountInEther) || amountInEther <= 0) {
                const error = 'Invalid amount. Must be a positive number.';
                console.error('[TRANSACTION ERROR]', { error, amount });
                throw new Error(error);
            }
            // Get wallet from database
            wallet = await this.walletService.getWalletByAddress(normalizedFromAddress);
            if (!wallet) {
                const error = 'Wallet not found';
                console.error('[TRANSACTION ERROR]', { error, address: normalizedFromAddress });
                throw new Error(error);
            }
            // Log transaction attempt
            await AuditLogService_1.AuditLogService.logPending(AuditLog_1.AuditAction.TRANSACTION_SEND, {
                userId: wallet.userId,
                walletAddress: normalizedFromAddress,
                metadata: {
                    toAddress: normalizedToAddress,
                    amount,
                    network,
                },
            });
            // Check balance
            const balance = await this.walletService.getBalance(normalizedFromAddress, network);
            const amountInWei = ethers_1.ethers.parseEther(amount);
            if (BigInt(balance.balanceInWei) < amountInWei) {
                const error = 'Insufficient balance';
                console.error('[TRANSACTION ERROR]', {
                    error,
                    address: normalizedFromAddress,
                    balance: balance.balance,
                    required: amount,
                });
                throw new Error(error);
            }
            // Get private key (decrypted)
            const privateKey = await this.walletService.getPrivateKeyByAddress(normalizedFromAddress);
            // Create wallet instance from private key
            const walletInstance = new ethers_1.ethers.Wallet(privateKey);
            // Get current gas price and nonce
            const gasPrice = await this.blockchainService.getGasPrice();
            const nonce = await this.blockchainService.getTransactionCount(normalizedFromAddress);
            console.log('[TRANSACTION INFO]', {
                from: normalizedFromAddress,
                to: normalizedToAddress,
                amount,
                gasPrice: ethers_1.ethers.formatUnits(gasPrice, 'gwei') + ' gwei',
                nonce,
            });
            // Create transaction request for gas estimation
            const txRequest = {
                to: normalizedToAddress,
                value: amountInWei,
                from: normalizedFromAddress,
            };
            // Estimate gas limit
            let gasLimit;
            try {
                gasLimit = await this.blockchainService.estimateGas(txRequest);
                // Add 10% buffer for safety
                gasLimit = (gasLimit * BigInt(110)) / BigInt(100);
                console.log('[TRANSACTION INFO] Gas limit estimated:', gasLimit.toString());
            }
            catch (error) {
                // Fallback to standard gas limit if estimation fails
                gasLimit = BigInt(21000);
                console.warn('[TRANSACTION WARNING] Gas estimation failed, using default:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    defaultGasLimit: gasLimit.toString(),
                });
            }
            // Check if balance is sufficient (including gas fees)
            const totalCost = amountInWei + (gasLimit * gasPrice);
            if (BigInt(balance.balanceInWei) < totalCost) {
                const error = `Insufficient balance. Required: ${ethers_1.ethers.formatEther(totalCost)} ETH (including gas fees)`;
                console.error('[TRANSACTION ERROR]', {
                    error,
                    balance: balance.balance,
                    amount,
                    gasFee: ethers_1.ethers.formatEther(gasLimit * gasPrice),
                    totalRequired: ethers_1.ethers.formatEther(totalCost),
                });
                throw new Error(error);
            }
            // Create final transaction
            const tx = {
                to: normalizedToAddress,
                value: amountInWei,
                gasPrice,
                gasLimit,
                nonce,
            };
            // Sign transaction
            const signedTx = await walletInstance.signTransaction(tx);
            const signedTxHex = signedTx;
            // Broadcast transaction
            txHash = await this.blockchainService.sendTransaction(signedTxHex);
            console.log('[TRANSACTION SUCCESS] Transaction broadcasted:', {
                hash: txHash,
                from: normalizedFromAddress,
                to: normalizedToAddress,
                amount,
            });
            // Save transaction to database within the transaction
            const transactionRepository = queryRunner.manager.getRepository(Transaction_1.Transaction);
            const transaction = transactionRepository.create({
                hash: txHash,
                fromAddress: normalizedFromAddress,
                toAddress: normalizedToAddress,
                amount: amountInWei.toString(),
                status: Transaction_1.TransactionStatus.PENDING,
                network,
                walletId: wallet.id,
                gasPrice: gasPrice.toString(),
            });
            const savedTransaction = await transactionRepository.save(transaction);
            // Commit the database transaction
            await queryRunner.commitTransaction();
            // Log successful transaction
            await AuditLogService_1.AuditLogService.logSuccess(AuditLog_1.AuditAction.TRANSACTION_SEND, {
                userId: wallet.userId,
                walletAddress: normalizedFromAddress,
                transactionHash: txHash,
                metadata: {
                    toAddress: normalizedToAddress,
                    amount,
                    network,
                    gasPrice: gasPrice.toString(),
                },
            });
            // Poll for transaction confirmation (async, don't wait)
            this.pollTransactionConfirmation(txHash, savedTransaction.id, wallet.userId).catch((error) => {
                console.error('[TRANSACTION ERROR] Failed to poll transaction confirmation:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    txHash,
                });
            });
            return savedTransaction;
        }
        catch (error) {
            // Rollback the database transaction
            await queryRunner.rollbackTransaction();
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[TRANSACTION ERROR] Transaction failed and rolled back:', {
                error: errorMessage,
                fromAddress: normalizedFromAddress,
                toAddress: normalizedToAddress,
                amount,
                network,
                txHash,
            });
            // Log failed transaction
            if (wallet) {
                await AuditLogService_1.AuditLogService.logFailure(AuditLog_1.AuditAction.TRANSACTION_SEND, errorMessage, {
                    userId: wallet.userId,
                    walletAddress: normalizedFromAddress,
                    transactionHash: txHash,
                    metadata: {
                        toAddress: normalizedToAddress,
                        amount,
                        network,
                    },
                });
            }
            throw error;
        }
        finally {
            // Release the query runner
            await queryRunner.release();
        }
    }
    /**
     * Polls for transaction confirmation
     * @param txHash - Transaction hash
     * @param transactionId - Database transaction ID
     * @param userId - User ID for audit logging
     */
    async pollTransactionConfirmation(txHash, transactionId, userId) {
        const maxAttempts = 30; // Poll for up to 5 minutes (10s intervals)
        let attempts = 0;
        console.log('[TRANSACTION POLLING] Starting confirmation polling:', { txHash, transactionId });
        while (attempts < maxAttempts) {
            try {
                const receipt = await this.blockchainService.getTransactionReceipt(txHash);
                if (receipt) {
                    const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
                    const newStatus = receipt.status === 1 ? Transaction_1.TransactionStatus.CONFIRMED : Transaction_1.TransactionStatus.FAILED;
                    await transactionRepository.update(transactionId, {
                        status: newStatus,
                        blockNumber: receipt.blockNumber,
                        gasUsed: receipt.gasUsed.toString(),
                    });
                    console.log('[TRANSACTION POLLING] Transaction confirmed:', {
                        txHash,
                        status: newStatus,
                        blockNumber: receipt.blockNumber,
                        gasUsed: receipt.gasUsed.toString(),
                    });
                    // Log confirmation or failure
                    if (newStatus === Transaction_1.TransactionStatus.CONFIRMED) {
                        await AuditLogService_1.AuditLogService.logSuccess(AuditLog_1.AuditAction.TRANSACTION_CONFIRM, {
                            userId,
                            transactionHash: txHash,
                            metadata: {
                                blockNumber: receipt.blockNumber,
                                gasUsed: receipt.gasUsed.toString(),
                            },
                        });
                    }
                    else {
                        await AuditLogService_1.AuditLogService.logFailure(AuditLog_1.AuditAction.TRANSACTION_FAIL, 'Transaction failed on blockchain', {
                            userId,
                            transactionHash: txHash,
                            metadata: {
                                blockNumber: receipt.blockNumber,
                            },
                        });
                    }
                    return;
                }
            }
            catch (error) {
                console.error('[TRANSACTION POLLING ERROR]', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    txHash,
                    attempt: attempts + 1,
                });
            }
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
        }
        // If we reach here, transaction is still pending
        console.warn('[TRANSACTION POLLING WARNING] Transaction still pending after max attempts:', {
            txHash,
            maxAttempts,
        });
    }
    /**
     * Gets transaction by hash
     * @param hash - Transaction hash
     * @returns Transaction or null if not found
     */
    async getTransactionByHash(hash) {
        const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
        return transactionRepository.findOne({
            where: { hash },
            relations: ['wallet'],
        });
    }
    /**
     * Gets transaction history for a wallet
     * @param address - Wallet address
     * @param network - Network
     * @param limit - Maximum number of transactions
     * @returns Array of transactions
     */
    async getTransactionHistory(address, network, limit = 10) {
        const normalizedAddress = (0, addressValidation_1.validateAndNormalizeAddress)(address);
        // Get from blockchain API
        const blockchainTransactions = await this.blockchainService.getTransactionHistory(normalizedAddress, limit);
        // Get from database
        const wallet = await this.walletService.getWalletByAddress(normalizedAddress);
        const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
        let dbTransactions = [];
        if (wallet) {
            dbTransactions = await transactionRepository.find({
                where: { walletId: wallet.id, network },
                order: { createdAt: 'DESC' },
                take: limit,
            });
        }
        // Merge and deduplicate transactions
        const allTransactions = [...dbTransactions];
        const txHashes = new Set(dbTransactions.map((tx) => tx.hash));
        for (const blockchainTx of blockchainTransactions) {
            if (!txHashes.has(blockchainTx.hash)) {
                // Map blockchain status to TransactionStatus enum
                let status;
                if (blockchainTx.status === 'confirmed') {
                    status = Transaction_1.TransactionStatus.CONFIRMED;
                }
                else if (blockchainTx.status === 'failed') {
                    status = Transaction_1.TransactionStatus.FAILED;
                }
                else {
                    status = Transaction_1.TransactionStatus.PENDING;
                }
                // Convert blockchain transaction to database format
                const transaction = transactionRepository.create({
                    hash: blockchainTx.hash,
                    fromAddress: blockchainTx.from,
                    toAddress: blockchainTx.to,
                    amount: blockchainTx.amount,
                    status,
                    network,
                    blockNumber: blockchainTx.blockNumber,
                    gasUsed: blockchainTx.gasUsed,
                    gasPrice: blockchainTx.gasPrice,
                    walletId: wallet?.id || 0, // Use 0 if wallet not found (shouldn't happen)
                });
                allTransactions.push(transaction);
            }
        }
        // Sort by timestamp/createdAt and limit
        return allTransactions
            .sort((a, b) => {
            const aTime = a.createdAt?.getTime() || 0;
            const bTime = b.createdAt?.getTime() || 0;
            return bTime - aTime;
        })
            .slice(0, limit);
    }
}
exports.TransactionService = TransactionService;
//# sourceMappingURL=TransactionService.js.map