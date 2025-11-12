import { User } from './User';
import { Transaction } from './Transaction';
export declare enum Network {
    TESTNET = "testnet",
    MAINNET = "mainnet"
}
export declare class Wallet {
    id: number;
    address: string;
    privateKeyEncrypted: string;
    network: Network;
    userId: number;
    user: User;
    transactions: Transaction[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Wallet.d.ts.map