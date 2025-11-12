"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const Wallet_1 = require("../entities/Wallet");
const Transaction_1 = require("../entities/Transaction");
// Register Network enum
// GraphQL enum values must match the TypeScript enum keys (TESTNET, MAINNET)
// not the values ('testnet', 'mainnet')
(0, type_graphql_1.registerEnumType)(Wallet_1.Network, {
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
(0, type_graphql_1.registerEnumType)(Transaction_1.TransactionStatus, {
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