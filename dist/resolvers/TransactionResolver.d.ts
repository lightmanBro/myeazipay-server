import { Network } from '../entities/Wallet';
import { JWTPayload } from '../utils/jwt';
declare class TransactionResponse {
    id: number;
    transactionHash: string;
    from: string;
    to: string;
    amount: string;
    amountInEther: string;
    status: string;
    network: string;
    blockNumber?: number;
    gasUsed?: string;
    gasPrice?: string;
    createdAt: Date;
}
export declare class TransactionResolver {
    /**
     * Send funds to another address
     */
    sendFunds(to: string, amount: string, network: Network, walletAddress: string, context: {
        user: JWTPayload;
    }): Promise<TransactionResponse>;
    /**
     * Get transaction by hash
     */
    transaction(hash: string): Promise<TransactionResponse | null>;
    /**
     * Get transaction history for a wallet
     */
    transactionHistory(address: string, network: Network, limit: number): Promise<TransactionResponse[]>;
}
export {};
//# sourceMappingURL=TransactionResolver.d.ts.map