import { AppDataSource } from '../config/database';
import { AuditLog, AuditAction, AuditStatus } from '../entities/AuditLog';

export interface AuditLogData {
  action: AuditAction;
  status: AuditStatus;
  userId?: number;
  walletAddress?: string;
  transactionHash?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Service for audit logging
 */
export class AuditLogService {
  /**
   * Creates an audit log entry
   * @param data - Audit log data
   * @returns The created audit log
   */
  static async log(data: AuditLogData): Promise<AuditLog> {
    try {
      const auditLogRepository = AppDataSource.getRepository(AuditLog);
      
      const auditLog = auditLogRepository.create({
        action: data.action,
        status: data.status,
        userId: data.userId,
        walletAddress: data.walletAddress,
        transactionHash: data.transactionHash,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        errorMessage: data.errorMessage,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      const savedLog = await auditLogRepository.save(auditLog);
      
      // Also log to console for immediate visibility
      console.log(`[AUDIT] ${data.action} - ${data.status}`, {
        userId: data.userId,
        walletAddress: data.walletAddress,
        transactionHash: data.transactionHash,
        error: data.errorMessage,
      });

      return savedLog;
    } catch (error) {
      // If audit logging fails, log to console but don't throw
      // We don't want audit logging failures to break the main flow
      console.error('[AUDIT LOG ERROR] Failed to save audit log:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data,
      });
      throw error;
    }
  }

  /**
   * Logs a successful action
   */
  static async logSuccess(
    action: AuditAction,
    data?: Partial<AuditLogData>
  ): Promise<void> {
    await this.log({
      action,
      status: AuditStatus.SUCCESS,
      ...data,
    }).catch((error) => {
      console.error('[AUDIT] Failed to log success:', error);
    });
  }

  /**
   * Logs a failed action
   */
  static async logFailure(
    action: AuditAction,
    errorMessage: string,
    data?: Partial<AuditLogData>
  ): Promise<void> {
    await this.log({
      action,
      status: AuditStatus.FAILURE,
      errorMessage,
      ...data,
    }).catch((error) => {
      console.error('[AUDIT] Failed to log failure:', error);
    });
  }

  /**
   * Logs a pending action
   */
  static async logPending(
    action: AuditAction,
    data?: Partial<AuditLogData>
  ): Promise<void> {
    await this.log({
      action,
      status: AuditStatus.PENDING,
      ...data,
    }).catch((error) => {
      console.error('[AUDIT] Failed to log pending:', error);
    });
  }

  /**
   * Gets audit logs for a user
   */
  static async getUserLogs(userId: number, limit: number = 50): Promise<AuditLog[]> {
    const auditLogRepository = AppDataSource.getRepository(AuditLog);
    return auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Gets audit logs for a wallet
   */
  static async getWalletLogs(walletAddress: string, limit: number = 50): Promise<AuditLog[]> {
    const auditLogRepository = AppDataSource.getRepository(AuditLog);
    return auditLogRepository.find({
      where: { walletAddress },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Gets audit logs for a transaction
   */
  static async getTransactionLogs(transactionHash: string): Promise<AuditLog[]> {
    const auditLogRepository = AppDataSource.getRepository(AuditLog);
    return auditLogRepository.find({
      where: { transactionHash },
      order: { createdAt: 'DESC' },
    });
  }
}
