"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const Wallet_1 = require("../entities/Wallet");
const Transaction_1 = require("../entities/Transaction");
const AuditLog_1 = require("../entities/AuditLog");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL, // ✅ For Render or any full connection URL
    host: process.env.DB_HOST || 'localhost', // ✅ fallback for local
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'wallet_db',
    entities: [User_1.User, Wallet_1.Wallet, Transaction_1.Transaction, AuditLog_1.AuditLog],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    migrations: ['src/migrations/**/*.ts'],
    migrationsTableName: 'migrations',
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false } // ✅ Needed for Render’s Postgres SSL
        : false,
});
//# sourceMappingURL=database.js.map