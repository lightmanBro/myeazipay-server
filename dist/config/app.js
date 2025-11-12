import dotenv from 'dotenv';
dotenv.config();
export const appConfig = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    encryptionKey: process.env.ENCRYPTION_KEY || '',
};
//# sourceMappingURL=app.js.map