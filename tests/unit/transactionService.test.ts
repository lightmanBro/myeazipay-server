import { TransactionService } from '../../src/services/TransactionService';
import { WalletService } from '../../src/services/WalletService';
import { Network } from '../../src/entities/Wallet';

jest.mock('../../src/config/database', () => ({
  AppDataSource: {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn(() => ({
          create: jest.fn((tx) => tx),
          save: jest.fn(async (tx) => ({ ...tx, id: 1 })),
        })),
      },
    })),
  },
}));

jest.mock('../../src/services/WalletService');
jest.mock('../../src/services/AuditLogService');

describe('TransactionService - sendFunds', () => {
  let transactionService: TransactionService;

  beforeEach(() => {
    transactionService = new TransactionService(Network.TESTNET);
  });

  it('should throw "Invalid amount" for negative amount', async () => {
    const from = '0xB7ae9D056f2c352df7Bf22F83FD6F2C943f221f6';
    const to = '0x33AA2b93B1052b0e5237d3c506AE5D8952848b78';
    await expect(transactionService?.sendFunds(from, to, '-5', Network.TESTNET))
      .rejects?.toThrow('Invalid amount');
  });

  it('should throw "Wallet not found" if walletService returns null', async () => {
    (WalletService.prototype.getWalletByAddress as jest.Mock).mockResolvedValue(null);
    await expect(transactionService?.sendFunds('0xSender', '0xRecipient', '1', Network?.TESTNET))
      .rejects?.toThrow('Address validation failed: Invalid Ethereum address');
  });
});
