import { Network } from '../../src/entities/Wallet';
import { TransactionStatus } from '../../src/entities/Transaction';
import '../../src/resolvers/enums'; // Import your enums registration file

describe('GraphQL Enums Registration', () => {
  it('should have Network enum defined', () => {
    expect(Network).toBeDefined();
    expect(Network.TESTNET).toBe('testnet');
    expect(Network.MAINNET).toBe('mainnet');
  });

  it('should have TransactionStatus enum defined', () => {
    expect(TransactionStatus).toBeDefined();
    expect(TransactionStatus.PENDING).toBe('pending');
    expect(TransactionStatus.CONFIRMED).toBe('confirmed');
    expect(TransactionStatus.FAILED).toBe('failed');
  });
});
