import { AppDataSource } from '../../src/config/database';
import { User } from '../../src/entities/User';
import { WalletService } from '../../src/services/WalletService';
import { Network, Wallet } from '../../src/entities/Wallet';
import bcrypt from 'bcryptjs';

describe('Wallet Integration Tests', () => {
  let walletService: WalletService;
  let testUser: User;

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
    walletService = new WalletService(Network.TESTNET);
    const userRepository = AppDataSource.getRepository(User);
    const passwordHash = await bcrypt.hash('testpassword', 12);
    testUser = await userRepository.save(
      userRepository.create({
        email: `test${Date.now()}@example.com`,
        passwordHash,
      })
    );
  });

  afterEach(async () => {
    const walletRepository = AppDataSource.getRepository(Wallet);
    await walletRepository.delete({ userId: testUser?.id });

    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ id: testUser?.id });
  });

  describe('createWallet', () => {
    it('should create a new wallet', async () => {
      const wallet = await walletService.createWallet(testUser?.id, Network.TESTNET);
      expect(wallet).toBeDefined();
      expect(wallet.address).toBeDefined();
      expect(wallet.privateKeyEncrypted).toBeDefined();
    });
  });
});
