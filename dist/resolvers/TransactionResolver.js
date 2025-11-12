"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Wallet_1 = require("../entities/Wallet");
const TransactionService_1 = require("../services/TransactionService");
const WalletService_1 = require("../services/WalletService");
const errorHandler_1 = require("../middleware/errorHandler");
const ethers_1 = require("ethers");
let TransactionResponse = class TransactionResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], TransactionResponse.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "transactionHash", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "from", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "to", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "amount", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "amountInEther", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "network", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], TransactionResponse.prototype, "blockNumber", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TransactionResponse.prototype, "gasUsed", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TransactionResponse.prototype, "gasPrice", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Date)
], TransactionResponse.prototype, "createdAt", void 0);
TransactionResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], TransactionResponse);
let TransactionResolver = class TransactionResolver {
    /**
     * Send funds to another address
     */
    async sendFunds(to, amount, network, walletAddress, context) {
        const transactionService = new TransactionService_1.TransactionService(network);
        // Verify wallet belongs to user
        const walletService = new WalletService_1.WalletService(network);
        const wallet = await walletService.getWalletByAddress(walletAddress, context.user.userId);
        if (!wallet) {
            throw new errorHandler_1.NotFoundError('Wallet not found or access denied');
        }
        try {
            const transaction = await transactionService.sendFunds(walletAddress, to, amount, network);
            return {
                id: transaction.id,
                transactionHash: transaction.hash,
                from: transaction.fromAddress,
                to: transaction.toAddress,
                amount: transaction.amount,
                amountInEther: ethers_1.ethers.formatEther(transaction.amount),
                status: transaction.status,
                network: transaction.network,
                blockNumber: transaction.blockNumber,
                gasUsed: transaction.gasUsed,
                gasPrice: transaction.gasPrice,
                createdAt: transaction.createdAt,
            };
        }
        catch (error) {
            throw new errorHandler_1.ValidationError(error instanceof Error ? error.message : 'Failed to send funds');
        }
    }
    /**
     * Get transaction by hash
     */
    async transaction(hash) {
        const transactionService = new TransactionService_1.TransactionService();
        const transaction = await transactionService.getTransactionByHash(hash);
        if (!transaction) {
            return null;
        }
        return {
            id: transaction.id,
            transactionHash: transaction.hash,
            from: transaction.fromAddress,
            to: transaction.toAddress,
            amount: transaction.amount,
            amountInEther: ethers_1.ethers.formatEther(transaction.amount),
            status: transaction.status,
            network: transaction.network,
            blockNumber: transaction.blockNumber,
            gasUsed: transaction.gasUsed,
            gasPrice: transaction.gasPrice,
            createdAt: transaction.createdAt,
        };
    }
    /**
     * Get transaction history for a wallet
     */
    async transactionHistory(address, network, limit) {
        const transactionService = new TransactionService_1.TransactionService(network);
        try {
            const transactions = await transactionService.getTransactionHistory(address, network, limit);
            return transactions.map((tx) => ({
                id: tx.id,
                transactionHash: tx.hash,
                from: tx.fromAddress,
                to: tx.toAddress,
                amount: tx.amount,
                amountInEther: ethers_1.ethers.formatEther(tx.amount),
                status: tx.status,
                network: tx.network,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed,
                gasPrice: tx.gasPrice,
                createdAt: tx.createdAt,
            }));
        }
        catch (error) {
            throw new errorHandler_1.ValidationError(error instanceof Error ? error.message : 'Failed to get transaction history');
        }
    }
};
exports.TransactionResolver = TransactionResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => TransactionResponse),
    (0, type_graphql_1.Authorized)(),
    __param(0, (0, type_graphql_1.Arg)('to')),
    __param(1, (0, type_graphql_1.Arg)('amount')),
    __param(2, (0, type_graphql_1.Arg)('network', () => Wallet_1.Network)),
    __param(3, (0, type_graphql_1.Arg)('walletAddress')),
    __param(4, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "sendFunds", null);
__decorate([
    (0, type_graphql_1.Query)(() => TransactionResponse, { nullable: true }),
    (0, type_graphql_1.Authorized)(),
    __param(0, (0, type_graphql_1.Arg)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "transaction", null);
__decorate([
    (0, type_graphql_1.Query)(() => [TransactionResponse]),
    (0, type_graphql_1.Authorized)(),
    __param(0, (0, type_graphql_1.Arg)('address')),
    __param(1, (0, type_graphql_1.Arg)('network', () => Wallet_1.Network)),
    __param(2, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int, { nullable: true, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "transactionHistory", null);
exports.TransactionResolver = TransactionResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], TransactionResolver);
//# sourceMappingURL=TransactionResolver.js.map