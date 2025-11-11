import { AuditLogService, AuditLogData } from '../../src/services/AuditLogService';
import { AppDataSource } from '../../src/config/database';
import { AuditAction, AuditStatus } from '../../src/entities/AuditLog';

jest.mock('../../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('AuditLogService', () => {
  let mockSave: jest.Mock;
  let mockCreate: jest.Mock;
  let mockRepo: any;

  beforeEach(() => {
    mockSave = jest.fn().mockImplementation((entity) => Promise.resolve({ ...entity, id: 1 }));
    mockCreate = jest.fn().mockImplementation((data) => data);
    mockRepo = {
      create: mockCreate,
      save: mockSave,
      find: jest.fn().mockResolvedValue([]),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
    jest.clearAllMocks();
  });

  it('should log an audit entry', async () => {
    const data: AuditLogData = {
      action: AuditAction.TRANSACTION_SEND,
      status: AuditStatus.SUCCESS,
      userId: 1,
      walletAddress: '0x123',
      transactionHash: '0xabc',
    };
    const result = await AuditLogService.log(data);

    expect(mockCreate).toHaveBeenCalledWith({
      ...data,
      metadata: undefined,
    });
    expect(mockSave).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it('should log success without throwing', async () => {
    await expect(
      AuditLogService.logSuccess(AuditAction.TRANSACTION_SEND, { userId: 2 })
    ).resolves.not.toThrow();
    expect(mockSave).toHaveBeenCalled();
  });

  it('should log failure without throwing', async () => {
    await expect(
      AuditLogService.logFailure(AuditAction.TRANSACTION_SEND, 'Error occurred', { userId: 2 })
    ).resolves.not.toThrow();
    expect(mockSave).toHaveBeenCalled();
  });

  it('should log pending without throwing', async () => {
    await expect(
      AuditLogService.logPending(AuditAction.TRANSACTION_SEND, { userId: 2 })
    ).resolves.not.toThrow();
    expect(mockSave).toHaveBeenCalled();
  });

  it('should get user logs', async () => {
    await AuditLogService.getUserLogs(1, 5);
    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { userId: 1 },
      order: { createdAt: 'DESC' },
      take: 5,
    });
  });

  it('should get wallet logs', async () => {
    await AuditLogService.getWalletLogs('0x123', 5);
    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { walletAddress: '0x123' },
      order: { createdAt: 'DESC' },
      take: 5,
    });
  });

  it('should get transaction logs', async () => {
    await AuditLogService.getTransactionLogs('0xabc');
    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { transactionHash: '0xabc' },
      order: { createdAt: 'DESC' },
    });
  });
});