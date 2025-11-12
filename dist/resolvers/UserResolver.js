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
import { Resolver, Mutation, Arg, ObjectType, Field, Query, Ctx, Authorized } from 'type-graphql';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { AuthenticationError, ValidationError } from '../middleware/errorHandler';
let WalletType = class WalletType {
};
__decorate([
    Field(),
    __metadata("design:type", Number)
], WalletType.prototype, "id", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], WalletType.prototype, "address", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], WalletType.prototype, "network", void 0);
__decorate([
    Field(),
    __metadata("design:type", Date)
], WalletType.prototype, "createdAt", void 0);
WalletType = __decorate([
    ObjectType()
], WalletType);
let UserType = class UserType {
};
__decorate([
    Field(),
    __metadata("design:type", Number)
], UserType.prototype, "id", void 0);
__decorate([
    Field(),
    __metadata("design:type", String)
], UserType.prototype, "email", void 0);
__decorate([
    Field(() => [WalletType]),
    __metadata("design:type", Array)
], UserType.prototype, "wallets", void 0);
__decorate([
    Field(),
    __metadata("design:type", Date)
], UserType.prototype, "createdAt", void 0);
__decorate([
    Field(),
    __metadata("design:type", Date)
], UserType.prototype, "updatedAt", void 0);
UserType = __decorate([
    ObjectType()
], UserType);
let AuthResponse = class AuthResponse {
};
__decorate([
    Field(),
    __metadata("design:type", String)
], AuthResponse.prototype, "token", void 0);
__decorate([
    Field(() => UserType),
    __metadata("design:type", UserType)
], AuthResponse.prototype, "user", void 0);
AuthResponse = __decorate([
    ObjectType()
], AuthResponse);
let UserResolver = class UserResolver {
    /**
     * User registration
     */
    async register(email, password) {
        // Validate input
        if (!email || !email.includes('@')) {
            throw new ValidationError('Invalid email address');
        }
        if (!password || password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters long');
        }
        const userRepository = AppDataSource.getRepository(User);
        // Check if user already exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ValidationError('User with this email already exists');
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        // Create user
        const user = userRepository.create({
            email,
            passwordHash,
        });
        const savedUser = await userRepository.save(user);
        // Generate token
        const token = generateToken({
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
        const userRepository = AppDataSource.getRepository(User);
        // Find user
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            throw new AuthenticationError('Invalid email or password');
        }
        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new AuthenticationError('Invalid email or password');
        }
        // Generate token
        const token = generateToken({
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
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: context.user.userId },
            relations: ['wallets'],
        });
        if (!user) {
            throw new AuthenticationError('User not found');
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
__decorate([
    Mutation(() => AuthResponse),
    __param(0, Arg('email')),
    __param(1, Arg('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    Mutation(() => AuthResponse),
    __param(0, Arg('email')),
    __param(1, Arg('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    Query(() => UserType),
    Authorized(),
    __param(0, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
UserResolver = __decorate([
    Resolver()
], UserResolver);
export { UserResolver };
//# sourceMappingURL=UserResolver.js.map