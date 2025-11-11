import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './config/database';
import { appConfig } from './config/app';
import './resolvers/enums'; // Register enums
import { UserResolver } from './resolvers/UserResolver';
import { WalletResolver } from './resolvers/WalletResolver';
import { TransactionResolver } from './resolvers/TransactionResolver';
import { errorHandler } from './middleware/errorHandler';
import { loggerMiddleware } from './middleware/logger';
import { verifyToken } from './utils/jwt';

async function startServer() {
  // Initialize database connection
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }

  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [UserResolver, WalletResolver, TransactionResolver],
    validate: false,
    authChecker: ({ context }) => {
      // Check if user is authenticated
      return !!context.user;
    },
  });

  // Create Express app
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: appConfig.corsOrigin,
    credentials: true,
  }));

  // Rate limiting - more lenient in development
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: appConfig.nodeEnv === 'development' ? 500 : 100, // Higher limit in development
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
  });
  app.use('/graphql', limiter);

  // Request logging
  app.use(loggerMiddleware);

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => {
      // Extract user from JWT token if present
      const authHeader = req.headers.authorization;
      let user = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          user = verifyToken(token);
        } catch (error) {
          // Token invalid or expired, user remains null
          // This is fine for public queries/mutations
        }
      }

      return { user, req };
    },
    introspection: appConfig.nodeEnv === 'development',
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  // Start server
  const PORT = appConfig.port;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    if (appConfig.nodeEnv === 'development') {
      console.log(`GraphQL Playground: http://localhost:${PORT}/graphql`);
    }
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

