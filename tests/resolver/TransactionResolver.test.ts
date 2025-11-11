import { TransactionResolver } from '../../src/resolvers/TransactionResolver';
import { TransactionService } from '../../src/services/TransactionService';
import { WalletService } from '../../src/services/WalletService';
import { ValidationError, NotFoundError } from '../../src/middleware/errorHandler';
import { Network } from '../../src/entities/Wallet';

// Mock all dependencies
jest.mock('../../src/services/TransactionService');
jest.mock('../../src/services/WalletService');
jest.mock('ethers', () => ({
  ethers: {
    formatEther: jest.fn().mockReturnValue('1.0'),
  },
  formatEther: jest.fn().mockReturnValue('1.0'),
}));

describe('TransactionResolver', () => {
  let resolver: TransactionResolver;

  const mockTransaction = {
    id: 1,
    hash: '0xabc123',
    fromAddress: '0xFrom',
    toAddress: '0xTo',
    amount: '1000000000000000000',
    status: 'success',
    network: Network.TESTNET,
    blockNumber: 1234,
    gasUsed: '21000',
    gasPrice: '1000000000',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new TransactionResolver();
  });

  describe('sendFunds', () => {
    it('should throw NotFoundError if wallet not found', async () => {
      (WalletService as jest.Mock).mockImplementation(() => ({
        getWalletByAddress: jest.fn().mockResolvedValue(null),
      }));

      const context = { user: { userId: 1, email: 'test@example.com' } };

      await expect(
        resolver.sendFunds('0xTo', '1.0', Network.TESTNET, '0xWallet', context)
      ).rejects.toThrow(NotFoundError);
    });

    it('should return transaction response if successful', async () => {
      (WalletService as jest.Mock).mockImplementation(() => ({
        getWalletByAddress: jest.fn().mockResolvedValue({ id: 1 }),
      }));

      (TransactionService as jest.Mock).mockImplementation(() => ({
        sendFunds: jest.fn().mockResolvedValue(mockTransaction),
      }));

      const context = { user: { userId: 1, email: 'test@example.com' } };

      const result = await resolver.sendFunds('0xTo', '1.0', Network.TESTNET, '0xWallet', context);

      expect(result).toMatchObject({
        transactionHash: '0xabc123',
        from: '0xFrom',
        to: '0xTo',
        amount: '1000000000000000000',
        amountInEther: '1.0',
        status: 'success',
      });
    });

    it('should throw ValidationError if TransactionService fails', async () => {
      (WalletService as jest.Mock).mockImplementation(() => ({
        getWalletByAddress: jest.fn().mockResolvedValue({ id: 1 }),
      }));

      (TransactionService as jest.Mock).mockImplementation(() => ({
        sendFunds: jest.fn().mockRejectedValue(new Error('Send failed')),
      }));

      const context = { user: { userId: 1, email: 'test@example.com' } };

      await expect(
        resolver.sendFunds('0xTo', '1.0', Network.TESTNET, '0xWallet', context)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('transaction', () => {
    it('should return transaction if found', async () => {
      (TransactionService as jest.Mock).mockImplementation(() => ({
        getTransactionByHash: jest.fn().mockResolvedValue(mockTransaction),
      }));

      const result = await resolver.transaction('0xabc123');

      expect(result).toMatchObject({
        transactionHash: '0xabc123',
        from: '0xFrom',
        to: '0xTo',
        status: 'success',
      });
    });

    it('should return null if transaction not found', async () => {
      (TransactionService as jest.Mock).mockImplementation(() => ({
        getTransactionByHash: jest.fn().mockResolvedValue(null),
      }));

      const result = await resolver.transaction('0xMissing');
      expect(result).toBeNull();
    });
  });

  describe('transactionHistory', () => {
    it('should return mapped transactions', async () => {
      (TransactionService as jest.Mock).mockImplementation(() => ({
        getTransactionHistory: jest.fn().mockResolvedValue([mockTransaction]),
      }));

      const result = await resolver.transactionHistory('0xWallet', Network.TESTNET, 10);

      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        transactionHash: '0xabc123',
        network: Network.TESTNET,
      });
    });

    it('should throw ValidationError if history fetch fails', async () => {
      (TransactionService as jest.Mock).mockImplementation(() => ({
        getTransactionHistory: jest.fn().mockRejectedValue(new Error('Fetch failed')),
      }));

      await expect(
        resolver.transactionHistory('0xWallet', Network.TESTNET, 10)
      ).rejects.toThrow(ValidationError);
    });
  });
});
