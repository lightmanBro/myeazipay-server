import { JWTPayload } from '../utils/jwt';
declare class WalletType {
    id: number;
    address: string;
    network: string;
    createdAt: Date;
}
declare class UserType {
    id: number;
    email: string;
    wallets: WalletType[];
    createdAt: Date;
    updatedAt: Date;
}
declare class AuthResponse {
    token: string;
    user: UserType;
}
export declare class UserResolver {
    /**
     * User registration
     */
    register(email: string, password: string): Promise<AuthResponse>;
    /**
     * User login
     */
    login(email: string, password: string): Promise<AuthResponse>;
    /**
     * Get current authenticated user
     */
    me(context: {
        user: JWTPayload;
    }): Promise<UserType>;
}
export {};
//# sourceMappingURL=UserResolver.d.ts.map