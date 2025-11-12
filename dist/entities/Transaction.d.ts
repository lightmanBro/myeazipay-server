import { Wallet, Network } from './Wallet';
export declare enum TransactionStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    FAILED = "failed"
}
export declare class Transaction {
    id: number;
    hash: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    status: TransactionStatus;
    network: Network;
    blockNumber?: number;
    gasUsed?: string;
    gasPrice?: string;
    walletId: number;
    wallet: Wallet;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Transaction.d.ts.map