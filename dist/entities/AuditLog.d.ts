export declare enum AuditAction {
    USER_REGISTER = "user_register",
    USER_LOGIN = "user_login",
    WALLET_CREATE = "wallet_create",
    TRANSACTION_SEND = "transaction_send",
    TRANSACTION_CONFIRM = "transaction_confirm",
    TRANSACTION_FAIL = "transaction_fail",
    BALANCE_CHECK = "balance_check",
    WALLET_ACCESS = "wallet_access"
}
export declare enum AuditStatus {
    SUCCESS = "success",
    FAILURE = "failure",
    PENDING = "pending"
}
export declare class AuditLog {
    id: number;
    action: AuditAction;
    status: AuditStatus;
    userId?: number;
    walletAddress?: string;
    transactionHash?: string;
    metadata?: string;
    errorMessage?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
//# sourceMappingURL=AuditLog.d.ts.map