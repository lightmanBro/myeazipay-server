import { registerEnumType } from 'type-graphql';
import { Network } from '../entities/Wallet';
import { TransactionStatus } from '../entities/Transaction';
// Register Network enum
// GraphQL enum values must match the TypeScript enum keys (TESTNET, MAINNET)
// not the values ('testnet', 'mainnet')
registerEnumType(Network, {
    name: 'Network',
    description: 'Blockchain network type',
    valuesConfig: {
        TESTNET: {
            description: 'Testnet network (Sepolia)',
        },
        MAINNET: {
            description: 'Mainnet network',
        },
    },
});
// Register TransactionStatus enum
registerEnumType(TransactionStatus, {
    name: 'TransactionStatus',
    description: 'Transaction status',
    valuesConfig: {
        PENDING: {
            description: 'Transaction is pending confirmation',
        },
        CONFIRMED: {
            description: 'Transaction is confirmed on blockchain',
        },
        FAILED: {
            description: 'Transaction failed',
        },
    },
});
//# sourceMappingURL=enums.js.map