import { WalletResolver } from '../../src/resolvers/WalletResolver';
import { WalletService } from '../../src/services/WalletService';
import { ValidationError } from '../../src/middleware/errorHandler';
import { Network } from '../../src/entities/Wallet';

jest.mock('../../src/services/WalletService');

describe('WalletResolver', () => {
  let resolver: WalletResolver;
  let mockWalletService: any;

  const mockUser = { userId: 1, email: 'test@example.com' };

  beforeEach(() => {
    resolver = new WalletResolver();
    mockWalletService = {
      createWallet: jest.fn(),
      getWalletByAddress: jest.fn(),
      getBalance: jest.fn(),
    };
    (WalletService as jest.Mock).mockImplementation(() => mockWalletService);
    jest.clearAllMocks();
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      const wallet = { id: 1, address: '0x123', network: Network.TESTNET, createdAt: new Date() };
      mockWalletService.createWallet.mockResolvedValue(wallet);

      const result = await resolver.createWallet(Network.TESTNET, { user: mockUser });

      expect(result.id).toBe(wallet.id);
      expect(result.address).toBe(wallet.address);
      expect(result.network).toBe(wallet.network);
      expect(mockWalletService.createWallet).toHaveBeenCalledWith(mockUser.userId, Network.TESTNET);
    });

    it('should throw ValidationError if service fails', async () => {
      mockWalletService.createWallet.mockRejectedValue(new Error('Service error'));

      await expect(resolver.createWallet(Network.TESTNET, { user: mockUser }))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('wallet', () => {
    it('should return wallet if found', async () => {
      const wallet = { id: 1, address: '0x123', network: Network.TESTNET, createdAt: new Date() };
      mockWalletService.getWalletByAddress.mockResolvedValue(wallet);

      const result = await resolver.wallet('0x123', { user: mockUser });

      expect(result?.id).toBe(wallet.id);
      expect(result?.address).toBe(wallet.address);
    });

    it('should return null if wallet not found', async () => {
      mockWalletService.getWalletByAddress.mockResolvedValue(null);

      const result = await resolver.wallet('0x123', { user: mockUser });

      expect(result).toBeNull();
    });
  });

  describe('balance', () => {
    it('should return balance successfully', async () => {
      const balanceData = { balance: '10', balanceInWei: '10000000000000000000' };
      mockWalletService.getBalance.mockResolvedValue(balanceData);

      const result = await resolver.balance('0x123', Network.TESTNET);

      expect(result.address).toBe('0x123');
      expect(result.balance).toBe(balanceData.balance);
      expect(result.balanceInWei).toBe(balanceData.balanceInWei);
      expect(result.network).toBe(Network.TESTNET);
      expect(result.lastUpdated).toBeInstanceOf(Date);
      expect(mockWalletService.getBalance).toHaveBeenCalledWith('0x123', Network.TESTNET);
    });

    it('should throw ValidationError if service fails', async () => {
      mockWalletService.getBalance.mockRejectedValue(new Error('Balance error'));

      await expect(resolver.balance('0x123', Network.TESTNET))
        .rejects.toThrow(ValidationError);
    });
  });
});
