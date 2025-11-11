import { AppDataSource } from '../../src/config/database';
import { User } from '../../src/entities/User';
import { TransactionService } from '../../src/services/TransactionService';
import { WalletService } from '../../src/services/WalletService';
import { Network, Wallet } from '../../src/entities/Wallet';
import { Transaction } from '../../src/entities/Transaction';
import bcrypt from 'bcryptjs';

describe('Transaction Integration Tests', () => {
  let transactionService: TransactionService;
  let walletService: WalletService;
  let testUser: User;
  let testWallet: Wallet;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  }, 20000);

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    transactionService = new TransactionService(Network.TESTNET);
    walletService = new WalletService(Network.TESTNET);

    const userRepository = AppDataSource.getRepository(User);
    const passwordHash = await bcrypt.hash('testpassword', 12);
    testUser = await userRepository.save(
      userRepository.create({
        email: `test${Date.now()}@example.com`,
        passwordHash,
      })
    );

    testWallet = await walletService.createWallet(testUser.id, Network.TESTNET);
  });

  afterEach(async () => {
    const transactionRepo = AppDataSource.getRepository(Transaction);
    await transactionRepo.delete({ walletId: testWallet?.id });

    const walletRepo = AppDataSource.getRepository(Wallet);
    await walletRepo.delete({ id: testWallet?.id });

    const userRepo = AppDataSource.getRepository(User);
    await userRepo.delete({ id: testUser?.id });
  });

  describe('getTransactionHistory', () => {
    it('should get transaction history for a wallet', async () => {
      const history = await transactionService.getTransactionHistory(
        testWallet.address,
        Network.TESTNET,
        10
      );
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('getTransactionByHash', () => {
    it('should return null for non-existent transaction', async () => {
      const tx = await transactionService.getTransactionByHash(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      );
      expect(tx).toBeNull();
    });
  });
});
