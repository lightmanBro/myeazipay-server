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
import { Resolver, Mutation, Arg, Query, ObjectType, Field, Ctx, Authorized, Int } from 'type-graphql';
import { Network } from '../entities/Wallet';
import { TransactionService } from '../services/TransactionService';
import { WalletService } from '../services/WalletService';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import { ethers } from 'ethers';
let TransactionResponse = class TransactionResponse {
};
__decorate([
    Field(),
    __metadata("design:type", Number)
], TransactionResponse.prototype, "id", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "transactionHash", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "from", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "to", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "amount", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "amountInEther", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "status", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], TransactionResponse.prototype, "network", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    __metadata("design:type", Number)
], TransactionResponse.prototype, "blockNumber", void 0);
__decorate([
    Field({ nullable: true }),
    __metadata("design:type", String)
], TransactionResponse.prototype, "gasUsed", void 0);
__decorate([
    Field({ nullable: true }),
    __metadata("design:type", String)
], TransactionResponse.prototype, "gasPrice", void 0);
__decorate([
    Field(),
    __metadata("design:type", Date)
], TransactionResponse.prototype, "createdAt", void 0);
TransactionResponse = __decorate([
    ObjectType()
], TransactionResponse);
let TransactionResolver = class TransactionResolver {
    /**
     * Send funds to another address
     */
    async sendFunds(to, amount, network, walletAddress, context) {
        const transactionService = new TransactionService(network);
        // Verify wallet belongs to user
        const walletService = new WalletService(network);
        const wallet = await walletService.getWalletByAddress(walletAddress, context.user.userId);
        if (!wallet) {
            throw new NotFoundError('Wallet not found or access denied');
        }
        try {
            const transaction = await transactionService.sendFunds(walletAddress, to, amount, network);
            return {
                id: transaction.id,
                transactionHash: transaction.hash,
                from: transaction.fromAddress,
                to: transaction.toAddress,
                amount: transaction.amount,
                amountInEther: ethers.formatEther(transaction.amount),
                status: transaction.status,
                network: transaction.network,
                blockNumber: transaction.blockNumber,
                gasUsed: transaction.gasUsed,
                gasPrice: transaction.gasPrice,
                createdAt: transaction.createdAt,
            };
        }
        catch (error) {
            throw new ValidationError(error instanceof Error ? error.message : 'Failed to send funds');
        }
    }
    /**
     * Get transaction by hash
     */
    async transaction(hash) {
        const transactionService = new TransactionService();
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
            amountInEther: ethers.formatEther(transaction.amount),
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
        const transactionService = new TransactionService(network);
        try {
            const transactions = await transactionService.getTransactionHistory(address, network, limit);
            return transactions.map((tx) => ({
                id: tx.id,
                transactionHash: tx.hash,
                from: tx.fromAddress,
                to: tx.toAddress,
                amount: tx.amount,
                amountInEther: ethers.formatEther(tx.amount),
                status: tx.status,
                network: tx.network,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed,
                gasPrice: tx.gasPrice,
                createdAt: tx.createdAt,
            }));
        }
        catch (error) {
            throw new ValidationError(error instanceof Error ? error.message : 'Failed to get transaction history');
        }
    }
};
__decorate([
    Mutation(() => TransactionResponse),
    Authorized(),
    __param(0, Arg('to')),
    __param(1, Arg('amount')),
    __param(2, Arg('network', () => Network)),
    __param(3, Arg('walletAddress')),
    __param(4, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "sendFunds", null);
__decorate([
    Query(() => TransactionResponse, { nullable: true }),
    Authorized(),
    __param(0, Arg('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "transaction", null);
__decorate([
    Query(() => [TransactionResponse]),
    Authorized(),
    __param(0, Arg('address')),
    __param(1, Arg('network', () => Network)),
    __param(2, Arg('limit', () => Int, { nullable: true, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "transactionHistory", null);
TransactionResolver = __decorate([
    Resolver()
], TransactionResolver);
export { TransactionResolver };
//# sourceMappingURL=TransactionResolver.js.map