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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
let WalletType = class WalletType {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], WalletType.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], WalletType.prototype, "address", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], WalletType.prototype, "network", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Date)
], WalletType.prototype, "createdAt", void 0);
WalletType = __decorate([
    (0, type_graphql_1.ObjectType)()
], WalletType);
let UserType = class UserType {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UserType.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserType.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [WalletType]),
    __metadata("design:type", Array)
], UserType.prototype, "wallets", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Date)
], UserType.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Date)
], UserType.prototype, "updatedAt", void 0);
UserType = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserType);
let AuthResponse = class AuthResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], AuthResponse.prototype, "token", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => UserType),
    __metadata("design:type", UserType)
], AuthResponse.prototype, "user", void 0);
AuthResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], AuthResponse);
let UserResolver = class UserResolver {
    /**
     * User registration
     */
    async register(email, password) {
        // Validate input
        if (!email || !email.includes('@')) {
            throw new errorHandler_1.ValidationError('Invalid email address');
        }
        if (!password || password.length < 6) {
            throw new errorHandler_1.ValidationError('Password must be at least 6 characters long');
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Check if user already exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new errorHandler_1.ValidationError('User with this email already exists');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = userRepository.create({
            email,
            passwordHash,
        });
        const savedUser = await userRepository.save(user);
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: savedUser.id,
            email: savedUser.email,
        });
        return {
            token,
            user: {
                id: savedUser.id,
                email: savedUser.email,
                wallets: [],
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt,
            },
        };
    }
    /**
     * User login
     */
    async login(email, password) {
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Find user
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            throw new errorHandler_1.AuthenticationError('Invalid email or password');
        }
        // Verify password
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            throw new errorHandler_1.AuthenticationError('Invalid email or password');
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                wallets: [],
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }
    /**
     * Get current authenticated user
     */
    async me(context) {
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({
            where: { id: context.user.userId },
            relations: ['wallets'],
        });
        if (!user) {
            throw new errorHandler_1.AuthenticationError('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            wallets: user.wallets.map((w) => ({
                id: w.id,
                address: w.address,
                network: w.network,
                createdAt: w.createdAt,
            })),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => AuthResponse),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Arg)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => AuthResponse),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Arg)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Query)(() => UserType),
    (0, type_graphql_1.Authorized)(),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
//# sourceMappingURL=UserResolver.js.map