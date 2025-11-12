"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./config/database");
const app_1 = require("./config/app");
require("./resolvers/enums"); // Register enums
const UserResolver_1 = require("./resolvers/UserResolver");
const WalletResolver_1 = require("./resolvers/WalletResolver");
const TransactionResolver_1 = require("./resolvers/TransactionResolver");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./middleware/logger");
const jwt_1 = require("./utils/jwt");
// ... rest of your code stays the same
async function startServer() {
    // Initialize database connection
    try {
        await database_1.AppDataSource.initialize();
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
    // Build GraphQL schema
    const schema = await (0, type_graphql_1.buildSchema)({
        resolvers: [UserResolver_1.UserResolver, WalletResolver_1.WalletResolver, TransactionResolver_1.TransactionResolver],
        validate: false,
        authChecker: ({ context }) => {
            // Check if user is authenticated
            return !!context.user;
        },
    });
    // Create Express app
    const app = (0, express_1.default)();
    // Security middleware
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: app_1.appConfig.corsOrigin,
        credentials: true,
    }));
    // Rate limiting - more lenient in development
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: app_1.appConfig.nodeEnv === 'development' ? 500 : 100, // Higher limit in development
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
    app.use(logger_1.loggerMiddleware);
    // Body parser
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Create Apollo Server
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema,
        context: ({ req }) => {
            // Extract user from JWT token if present
            const authHeader = req.headers.authorization;
            let user = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.substring(7);
                    user = (0, jwt_1.verifyToken)(token);
                }
                catch (error) {
                    // Token invalid or expired, user remains null
                    // This is fine for public queries/mutations
                }
            }
            return { user, req };
        },
        introspection: app_1.appConfig.nodeEnv === 'development',
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: app, path: '/graphql' });
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // Error handling middleware (must be last)
    app.use(errorHandler_1.errorHandler);
    // Start server
    const PORT = app_1.appConfig.port;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
        if (app_1.appConfig.nodeEnv === 'development') {
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
//# sourceMappingURL=server.js.map