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
exports.WalletResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Wallet_1 = require("../entities/Wallet");
const WalletService_1 = require("../services/WalletService");
const errorHandler_1 = require("../middleware/errorHandler");
let WalletResponse = class WalletResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], WalletResponse.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], WalletResponse.prototype, "address", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], WalletResponse.prototype, "network", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Date)
], WalletResponse.prototype, "createdAt", void 0);
WalletResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], WalletResponse);
let BalanceResponse = class BalanceResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], BalanceResponse.prototype, "address", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], BalanceResponse.prototype, "balance", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], BalanceResponse.prototype, "balanceInWei", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], BalanceResponse.prototype, "network", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Date)
], BalanceResponse.prototype, "lastUpdated", void 0);
BalanceResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], BalanceResponse);
let WalletResolver = class WalletResolver {
    /**
     * Create a new wallet
     */
    async createWallet(network, context) {
        const walletService = new WalletService_1.WalletService(network);
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
            throw new errorHandler_1.ValidationError(error instanceof Error ? error.message : 'Failed to create wallet');
        }
    }
    /**
     * Get wallet by address
     */
    async wallet(address, context) {
        const walletService = new WalletService_1.WalletService();
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
        const walletService = new WalletService_1.WalletService(network);
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
            throw new errorHandler_1.ValidationError(error instanceof Error ? error.message : 'Failed to get balance');
        }
    }
};
exports.WalletResolver = WalletResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => WalletResponse),
    (0, type_graphql_1.Authorized)(),
    __param(0, (0, type_graphql_1.Arg)('network', () => Wallet_1.Network)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletResolver.prototype, "createWallet", null);
__decorate([
    (0, type_graphql_1.Query)(() => WalletResponse, { nullable: true }),
    (0, type_graphql_1.Authorized)(),
    __param(0, (0, type_graphql_1.Arg)('address')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletResolver.prototype, "wallet", null);
__decorate([
    (0, type_graphql_1.Query)(() => BalanceResponse),
    (0, type_graphql_1.Authorized)(),
    __param(0, (0, type_graphql_1.Arg)('address')),
    __param(1, (0, type_graphql_1.Arg)('network', () => Wallet_1.Network)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WalletResolver.prototype, "balance", null);
exports.WalletResolver = WalletResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], WalletResolver);
//# sourceMappingURL=WalletResolver.js.map