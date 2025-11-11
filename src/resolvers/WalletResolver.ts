import { Resolver, Mutation, Arg, Query, ObjectType, Field, Ctx, Authorized } from 'type-graphql';
import { Network } from '../entities/Wallet';
import { WalletService } from '../services/WalletService';
import { JWTPayload } from '../utils/jwt';
import { ValidationError } from '../middleware/errorHandler';

@ObjectType()
class WalletResponse {
  @Field()
  id!: number;

  @Field()
  address!: string;

  @Field()
  network!: string;

  @Field()
  createdAt!: Date;
}

@ObjectType()
class BalanceResponse {
  @Field()
  address!: string;

  @Field()
  balance!: string;

  @Field()
  balanceInWei!: string;

  @Field()
  network!: string;

  @Field()
  lastUpdated!: Date;
}

@Resolver()
export class WalletResolver {
  /**
   * Create a new wallet
   */
  @Mutation(() => WalletResponse)
  @Authorized()
  async createWallet(
    @Arg('network', () => Network) network: Network,
    @Ctx() context: { user: JWTPayload }
  ): Promise<WalletResponse> {
    const walletService = new WalletService(network);

    try {
      const wallet = await walletService.createWallet(context.user.userId, network);

      return {
        id: wallet.id,
        address: wallet.address,
        network: wallet.network,
        createdAt: wallet.createdAt,
      };
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : 'Failed to create wallet');
    }
  }

  /**
   * Get wallet by address
   */
  @Query(() => WalletResponse, { nullable: true })
  @Authorized()
  async wallet(
    @Arg('address') address: string,
    @Ctx() context: { user: JWTPayload }
  ): Promise<WalletResponse | null> {
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
  @Query(() => BalanceResponse)
  @Authorized()
  async balance(
    @Arg('address') address: string,
    @Arg('network', () => Network) network: Network
  ): Promise<BalanceResponse> {
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
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : 'Failed to get balance');
    }
  }
}

