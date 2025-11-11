import { BlockchainService } from '../../src/services/BlockchainService';
import nock from 'nock';
import { ethers } from 'ethers';
import { Network } from '../../src/entities/Wallet';

// Mock ethers provider
jest.mock('ethers', () => {
  const mockProvider = {
    getBalance: jest.fn(),
    getTransactionCount: jest.fn(),
    getFeeData: jest.fn(),
    broadcastTransaction: jest.fn(),
    getTransactionReceipt: jest.fn(),
    waitForTransaction: jest.fn(),
  };

  return {
    ethers: {
      JsonRpcProvider: jest.fn(() => mockProvider),
      formatEther: jest.fn((value: string) => value),
      parseEther: jest.fn((value: string) => value),
    },
  };
});

describe('BlockchainService', () => {
  let blockchainService: BlockchainService;

  beforeEach(() => {
    process.env.ALCHEMY_API_KEY = 'test-key';
    blockchainService = new BlockchainService(Network.TESTNET);
    jest.clearAllMocks();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('getBalance', () => {
    it('should get balance for an address', async () => {
      const mockProvider = new ethers.JsonRpcProvider('');
      (mockProvider.getBalance as jest.Mock).mockResolvedValue(BigInt('1000000000000000000')); // 1 ETH

      const balance = await blockchainService.getBalance('0xB7ae9D056f2c352df7Bf22F83FD6F2C943f221f6');
      expect(balance).toBe('1000000000000000000');
    });

    it('should throw error on failure', async () => {
      const mockProvider = new ethers.JsonRpcProvider('');
      (mockProvider.getBalance as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        blockchainService.getBalance('0xB7ae9D056f2c352df7Bf22F83FD6F2C943f221f6')
      ).rejects.toThrow();
    });
  });

  describe('getTransactionCount', () => {
    it('should get transaction count for an address', async () => {
      const mockProvider = new ethers.JsonRpcProvider('');
      (mockProvider.getTransactionCount as jest.Mock).mockResolvedValue(5);

      const count = await blockchainService.getTransactionCount('0xB7ae9D056f2c352df7Bf22F83FD6F2C943f221f6');
      expect(count).toBe(5);
    });
  });

  describe('getGasPrice', () => {
    it('should get current gas price', async () => {
      const mockProvider = new ethers.JsonRpcProvider('');
      (mockProvider.getFeeData as jest.Mock).mockResolvedValue({
        gasPrice: BigInt('20000000000'), // 20 gwei
      });

      const gasPrice = await blockchainService.getGasPrice();
      expect(gasPrice).toBe(BigInt('20000000000'));
    });
  });
});

