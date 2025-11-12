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
export declare class AuditLogService {
    /**
     * Creates an audit log entry
     * @param data - Audit log data
     * @returns The created audit log
     */
    static log(data: AuditLogData): Promise<AuditLog>;
    /**
     * Logs a successful action
     */
    static logSuccess(action: AuditAction, data?: Partial<AuditLogData>): Promise<void>;
    /**
     * Logs a failed action
     */
    static logFailure(action: AuditAction, errorMessage: string, data?: Partial<AuditLogData>): Promise<void>;
    /**
     * Logs a pending action
     */
    static logPending(action: AuditAction, data?: Partial<AuditLogData>): Promise<void>;
    /**
     * Gets audit logs for a user
     */
    static getUserLogs(userId: number, limit?: number): Promise<AuditLog[]>;
    /**
     * Gets audit logs for a wallet
     */
    static getWalletLogs(walletAddress: string, limit?: number): Promise<AuditLog[]>;
    /**
     * Gets audit logs for a transaction
     */
    static getTransactionLogs(transactionHash: string): Promise<AuditLog[]>;
}
//# sourceMappingURL=AuditLogService.d.ts.map