import { ethers } from 'ethers';
import { getAlchemyRpcUrl, getEtherscanApiUrl, blockchainConfig } from '../config/blockchain';
import { Network } from '../entities/Wallet';
import axios from 'axios';

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
export class BlockchainService {
  private alchemyProvider: ethers.JsonRpcProvider;
  private etherscanApiUrl: string;

  constructor(network: Network = Network.TESTNET) {
    const networkString = network === Network.TESTNET ? 'testnet' : 'mainnet';
    const rpcUrl = getAlchemyRpcUrl(networkString);
    this.alchemyProvider = new ethers.JsonRpcProvider(rpcUrl);
    this.etherscanApiUrl = getEtherscanApiUrl(networkString);
  }

  /**
   * Gets the balance of an address from the blockchain
   * @param address - The wallet address
   * @returns Balance in Wei as a string
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.alchemyProvider.getBalance(address);
      console.log('[BLOCKCHAIN INFO] Balance retrieved:', { address, balance: balance.toString() });
      return balance.toString();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // console.error('[BLOCKCHAIN ERROR] Failed to get balance:', { error: errorMessage, address });
      throw new Error(`Failed to get balance: ${errorMessage}`);
    }
  }

  /**
   * Gets the transaction count (nonce) for an address
   * @param address - The wallet address
   * @returns The transaction count
   */
  async getTransactionCount(address: string): Promise<number> {
    try {
      const count = await this.alchemyProvider.getTransactionCount(address);
      console.log('[BLOCKCHAIN INFO] Transaction count retrieved:', { address, count });
      return count;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[BLOCKCHAIN ERROR] Failed to get transaction count:', { error: errorMessage, address });
      throw new Error(`Failed to get transaction count: ${errorMessage}`);
    }
  }

  /**
   * Gets the current gas price
   * @returns Gas price in Wei
   */
  async getGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.alchemyProvider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);
      console.log('[BLOCKCHAIN INFO] Gas price retrieved:', { gasPrice: gasPrice.toString() });
      return gasPrice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[BLOCKCHAIN ERROR] Failed to get gas price:', { error: errorMessage });
      throw new Error(`Failed to get gas price: ${errorMessage}`);
    }
  }

  /**
   * Estimates gas limit for a transaction
   * @param transaction - The transaction request
   * @returns Estimated gas limit
   */
  async estimateGas(transaction: ethers.TransactionRequest): Promise<bigint> {
    try {
      const gasEstimate = await this.alchemyProvider.estimateGas(transaction);
      console.log('[BLOCKCHAIN INFO] Gas estimated:', { gasEstimate: gasEstimate.toString(), to: transaction.to });
      return gasEstimate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('[BLOCKCHAIN WARNING] Gas estimation failed, using default:', { error: errorMessage, to: transaction.to });
      // Fallback to standard gas limit for simple transfers
      return BigInt(21000);
    }
  }

  /**
   * Broadcasts a signed transaction to the blockchain
   * @param signedTx - The signed transaction in hex format
   * @returns Transaction hash
   */
  async sendTransaction(signedTx: string): Promise<string> {
    try {
      const txResponse = await this.alchemyProvider.broadcastTransaction(signedTx);
      console.log('[BLOCKCHAIN SUCCESS] Transaction broadcasted:', { hash: txResponse.hash });
      return txResponse.hash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[BLOCKCHAIN ERROR] Failed to send transaction:', { error: errorMessage });
      throw new Error(`Failed to send transaction: ${errorMessage}`);
    }
  }

  /**
   * Gets transaction receipt to check confirmation status
   * @param txHash - Transaction hash
   * @returns Transaction receipt or null if not found
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      const receipt = await this.alchemyProvider.getTransactionReceipt(txHash);
      if (receipt) {
        console.log('[BLOCKCHAIN INFO] Transaction receipt retrieved:', {
          hash: txHash,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
        });
      }
      return receipt;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[BLOCKCHAIN ERROR] Failed to get transaction receipt:', { error: errorMessage, txHash });
      throw new Error(`Failed to get transaction receipt: ${errorMessage}`);
    }
  }

  /**
   * Gets transaction history for an address using Etherscan API
   * @param address - The wallet address
   * @param limit - Maximum number of transactions to return
   * @returns Array of transactions
   */
  async getTransactionHistory(address: string, limit: number = 10): Promise<TransactionReceipt[]> {
    try {
      // Try Etherscan first if API key is available
      if (blockchainConfig.etherscanApiKey) {
        try {
          const response = await axios.get(this.etherscanApiUrl, {
            params: {
              module: 'account',
              action: 'txlist',
              address,
              startblock: 0,
              endblock: 99999999,
              page: 1,
              offset: limit,
              sort: 'desc',
              apikey: blockchainConfig.etherscanApiKey,
            },
          });

          // Handle Etherscan API response
          if (response.data.status === '1' && response.data.result) {
            const transactions = Array.isArray(response.data.result) ? response.data.result : [];
            return transactions.slice(0, limit).map((tx: any) => ({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              amount: tx.value || '0',
              status: tx.txreceipt_status === '1' ? 'confirmed' : (tx.txreceipt_status === '0' ? 'failed' : 'pending'),
              blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 10) : undefined,
              gasUsed: tx.gasUsed,
              gasPrice: tx.gasPrice,
              timestamp: tx.timeStamp ? parseInt(tx.timeStamp, 10) : undefined,
            }));
          }

          // Handle "No transactions found" case
          if (response.data.message === 'No transactions found' || 
              (response.data.status === '0' && response.data.result === '[]')) {
            return [];
          }

          // If Etherscan returns an error, log it and fall through to Alchemy fallback
          console.warn(`Etherscan API error: ${response.data.message || 'Unknown error'}. Falling back to Alchemy.`);
        } catch (etherscanError) {
          // If Etherscan request fails, fall through to Alchemy fallback
          console.warn(`Etherscan API request failed: ${etherscanError instanceof Error ? etherscanError.message : 'Unknown error'}. Falling back to Alchemy.`);
        }
      }

      // Fallback to Alchemy if Etherscan is not available or failed
      return this.getTransactionHistoryFromAlchemy(address, limit);
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets transaction history from Alchemy (fallback method)
   * Uses Alchemy's getAssetTransfers API via RPC
   * @param address - The wallet address
   * @param limit - Maximum number of transactions to return
   * @returns Array of transactions
   */
  private async getTransactionHistoryFromAlchemy(address: string, limit: number): Promise<TransactionReceipt[]> {
    try {
      // Try Alchemy's getAssetTransfers method via RPC
      try {
        const response = await this.alchemyProvider.send('alchemy_getAssetTransfers', [
          {
            fromBlock: '0x0',
            toBlock: 'latest',
            fromAddress: address,
            category: ['external'],
            maxCount: `0x${limit.toString(16)}`,
            excludeZeroValue: false,
          },
        ]);

        const transfers = response.transfers || [];
        if (transfers.length > 0) {
          return transfers.slice(0, limit).map((transfer: any) => ({
            hash: transfer.hash || '',
            from: transfer.from || address,
            to: transfer.to || '',
            amount: transfer.value?.toString() || '0',
            status: transfer.blockNum ? 'confirmed' : 'pending',
            blockNumber: transfer.blockNum ? parseInt(transfer.blockNum, 16) : undefined,
            gasUsed: undefined,
            gasPrice: undefined,
            timestamp: undefined,
          }));
        }
      } catch (alchemyError) {
        console.log('Alchemy getAssetTransfers failed:', alchemyError instanceof Error ? alchemyError?.message : 'Unknown error');
      }

      // If no transactions found or Alchemy method failed, return empty array
      // This is normal for new wallets with no transaction history
      return [];
    } catch (error) {
      // If all methods fail, return empty array instead of throwing
      // This allows the UI to show "No transactions found" instead of an error
      console.warn('Transaction history unavailable. Consider using Etherscan API key for better transaction history support.');
      return [];
    }
  }

  /**
   * Waits for a transaction to be confirmed
   * @param txHash - Transaction hash
   * @param confirmations - Number of confirmations to wait for (default: 1)
   * @returns Transaction receipt
   */
  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt | null> {
    try {
      console.log('[BLOCKCHAIN INFO] Waiting for transaction:', { txHash, confirmations });
      const receipt = await this.alchemyProvider.waitForTransaction(txHash, confirmations);
      if (receipt) {
        console.log('[BLOCKCHAIN SUCCESS] Transaction confirmed:', {
          hash: txHash,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
        });
      }
      return receipt;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[BLOCKCHAIN ERROR] Failed to wait for transaction:', { error: errorMessage, txHash });
      throw new Error(`Failed to wait for transaction: ${errorMessage}`);
    }
  }
}

