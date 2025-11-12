import { Network } from '../entities/Wallet';
import { JWTPayload } from '../utils/jwt';
declare class WalletResponse {
    id: number;
    address: string;
    network: string;
    createdAt: Date;
}
declare class BalanceResponse {
    address: string;
    balance: string;
    balanceInWei: string;
    network: string;
    lastUpdated: Date;
}
export declare class WalletResolver {
    /**
     * Create a new wallet
     */
    createWallet(network: Network, context: {
        user: JWTPayload;
    }): Promise<WalletResponse>;
    /**
     * Get wallet by address
     */
    wallet(address: string, context: {
        user: JWTPayload;
    }): Promise<WalletResponse | null>;
    /**
     * Get wallet balance from blockchain
     */
    balance(address: string, network: Network): Promise<BalanceResponse>;
}
export {};
//# sourceMappingURL=WalletResolver.d.ts.map