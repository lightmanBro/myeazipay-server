import { DataSource } from 'typeorm';
import { User } from '../entities/User.js';
import { Wallet } from '../entities/Wallet.js';
import { Transaction } from '../entities/Transaction.js';
import { AuditLog } from '../entities/AuditLog.js';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wallet_db',
  entities: [User, Wallet, Transaction, AuditLog],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['dist/migrations/**/*.js'], // Changed to .js
  migrationsTableName: 'migrations',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});