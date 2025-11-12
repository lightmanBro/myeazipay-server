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
import { Resolver, Mutation, Arg, Query, ObjectType, Field, Ctx, Authorized } from 'type-graphql';
import { Network } from '../entities/Wallet';
import { WalletService } from '../services/WalletService';
import { ValidationError } from '../middleware/errorHandler';
let WalletResponse = class WalletResponse {
};
__decorate([
    Field(),
    __metadata("design:type", Number)
], WalletResponse.prototype, "id", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], WalletResponse.prototype, "address", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], WalletResponse.prototype, "network", void 0);
__decorate([
    Field(),
    __metadata("design:type", Date)
], WalletResponse.prototype, "createdAt", void 0);
WalletResponse = __decorate([
    ObjectType()
], WalletResponse);
let BalanceResponse = class BalanceResponse {
};
__decorate([
    Field(),
    __metadata("design:type", String)
], BalanceResponse.prototype, "address", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], BalanceResponse.prototype, "balance", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], BalanceResponse.prototype, "balanceInWei", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], BalanceResponse.prototype, "network", void 0);
__decorate([
    Field(),
    __metadata("design:type", Date)
], BalanceResponse.prototype, "lastUpdated", void 0);
BalanceResponse = __decorate([
    ObjectType()
], BalanceResponse);
let WalletResolver = class WalletResolver {
    /**
     * Create a new wallet
     */
    async createWallet(network, context) {
        const walletService = new WalletService(network);
        try {
            const wallet = await walletService.createWallet(context.user.userId, network);
            return {
                id: wallet.id,
                address: wallet.address,
                network: wallet.network,
                createdAt: wallet.createdAt,
            };
        }
        catch (error) {
            throw new ValidationError(error instanceof Error ? error.message : 'Failed to create wallet');
        }
    }
    /**
     * Get wallet by address
     */
    async wallet(address, context) {
        const walletService = new WalletService();
        const wallet = await walletService.getWalletByAddress(address, context.user.userId);
        if (!wallet) {
            return null;
        }
        return {
            id: wallet.id,
            address: wallet.address,
            network: wallet.network,
            createdAt: wallet.createdAt,
        };
    }
    /**
     * Get wallet balance from blockchain
     */
    async balance(address, network) {
        const walletService = new WalletService(network);
        try {
            const balanceData = await walletService.getBalance(address, network);
            return {
                address,
                balance: balanceData.balance,
                balanceInWei: balanceData.balanceInWei,
                network,
                lastUpdated: new Date(),
            };
        }
        catch (error) {
            throw new ValidationError(error instanceof Error ? error.message : 'Failed to get balance');
        }
    }
};
__decorate([
    Mutation(() => WalletResponse),
    Authorized(),
    __param(0, Arg('network', () => Network)),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletResolver.prototype, "createWallet", null);
__decorate([
    Query(() => WalletResponse, { nullable: true }),
    Authorized(),
    __param(0, Arg('address')),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletResolver.prototype, "wallet", null);
__decorate([
    Query(() => BalanceResponse),
    Authorized(),
    __param(0, Arg('address')),
    __param(1, Arg('network', () => Network)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WalletResolver.prototype, "balance", null);
WalletResolver = __decorate([
    Resolver()
], WalletResolver);
export { WalletResolver };
//# sourceMappingURL=WalletResolver.js.map