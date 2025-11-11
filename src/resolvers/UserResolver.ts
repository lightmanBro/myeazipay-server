import { Resolver, Mutation, Arg, ObjectType, Field, Query, Ctx, Authorized } from 'type-graphql';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import { generateToken, JWTPayload } from '../utils/jwt';
import { AuthenticationError, ValidationError } from '../middleware/errorHandler';

@ObjectType()
class WalletType {
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
class UserType {
  @Field()
  id!: number;

  @Field()
  email!: string;

  @Field(() => [WalletType])
  wallets!: WalletType[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
class AuthResponse {
  @Field()
  token!: string;

  @Field(() => UserType)
  user!: UserType;
}

@Resolver()
export class UserResolver {
  /**
   * User registration
   */
  @Mutation(() => AuthResponse)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<AuthResponse> {
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
  @Mutation(() => AuthResponse)
  async login(@Arg('email') email: string, @Arg('password') password: string): Promise<AuthResponse> {
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
  @Query(() => UserType)
  @Authorized()
  async me(@Ctx() context: { user: JWTPayload }): Promise<UserType> {
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
}

