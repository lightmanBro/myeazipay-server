import { Resolver, Mutation, Arg, Query, ObjectType, Field, Ctx, Authorized, Int } from 'type-graphql';
import { Network } from '../entities/Wallet';
import { TransactionService } from '../services/TransactionService';
import { WalletService } from '../services/WalletService';
import { JWTPayload } from '../utils/jwt';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import { ethers } from 'ethers';

@ObjectType()
class TransactionResponse {
  @Field()
  id!: number;

  @Field()
  transactionHash!: string;

  @Field()
  from!: string;

  @Field()
  to!: string;

  @Field()
  amount!: string;

  @Field()
  amountInEther!: string;

  @Field()
  status!: string;

  @Field()
  network!: string;

  @Field(() => Int, { nullable: true })
  blockNumber?: number;

  @Field({ nullable: true })
  gasUsed?: string;

  @Field({ nullable: true })
  gasPrice?: string;

  @Field()
  createdAt!: Date;
}

@Resolver()
export class TransactionResolver {
  /**
   * Send funds to another address
   */
  @Mutation(() => TransactionResponse)
  @Authorized()
  async sendFunds(
    @Arg('to') to: string,
    @Arg('amount') amount: string,
    @Arg('network', () => Network) network: Network,
    @Arg('walletAddress') walletAddress: string,
    @Ctx() context: { user: JWTPayload }
  ): Promise<TransactionResponse> {
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
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : 'Failed to send funds');
    }
  }

  /**
   * Get transaction by hash
   */
  @Query(() => TransactionResponse, { nullable: true })
  @Authorized()
  async transaction(@Arg('hash') hash: string): Promise<TransactionResponse | null> {
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
  @Query(() => [TransactionResponse])
  @Authorized()
  async transactionHistory(
    @Arg('address') address: string,
    @Arg('network', () => Network) network: Network,
    @Arg('limit', () => Int, { nullable: true, defaultValue: 10 }) limit: number
  ): Promise<TransactionResponse[]> {
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
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : 'Failed to get transaction history');
    }
  }
}

