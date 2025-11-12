import { Table, TableForeignKey, TableIndex } from 'typeorm';
export class InitialSchema1700000000000 {
    async up(queryRunner) {
        // Create users table
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'email',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'passwordHash',
                    type: 'varchar',
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        // Create wallets table
        await queryRunner.createTable(new Table({
            name: 'wallets',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'address',
                    type: 'varchar',
                },
                {
                    name: 'privateKeyEncrypted',
                    type: 'text',
                },
                {
                    name: 'network',
                    type: 'enum',
                    enum: ['testnet', 'mainnet'],
                    default: "'testnet'",
                },
                {
                    name: 'userId',
                    type: 'int',
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        // Create transactions table
        await queryRunner.createTable(new Table({
            name: 'transactions',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'hash',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'fromAddress',
                    type: 'varchar',
                },
                {
                    name: 'toAddress',
                    type: 'varchar',
                },
                {
                    name: 'amount',
                    type: 'decimal',
                    precision: 36,
                    scale: 18,
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['pending', 'confirmed', 'failed'],
                    default: "'pending'",
                },
                {
                    name: 'network',
                    type: 'enum',
                    enum: ['testnet', 'mainnet'],
                },
                {
                    name: 'blockNumber',
                    type: 'int',
                    isNullable: true,
                },
                {
                    name: 'gasUsed',
                    type: 'decimal',
                    precision: 36,
                    scale: 18,
                    isNullable: true,
                },
                {
                    name: 'gasPrice',
                    type: 'decimal',
                    precision: 36,
                    scale: 18,
                    isNullable: true,
                },
                {
                    name: 'walletId',
                    type: 'int',
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        // Create foreign keys
        await queryRunner.createForeignKey('wallets', new TableForeignKey({
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('transactions', new TableForeignKey({
            columnNames: ['walletId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'wallets',
            onDelete: 'CASCADE',
        }));
        // Create indexes
        await queryRunner.createIndex('wallets', new TableIndex({
            name: 'IDX_wallets_address',
            columnNames: ['address'],
        }));
        await queryRunner.createIndex('wallets', new TableIndex({
            name: 'IDX_wallets_userId',
            columnNames: ['userId'],
        }));
        await queryRunner.createIndex('transactions', new TableIndex({
            name: 'IDX_transactions_hash',
            columnNames: ['hash'],
        }));
        await queryRunner.createIndex('transactions', new TableIndex({
            name: 'IDX_transactions_fromAddress',
            columnNames: ['fromAddress'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('transactions');
        await queryRunner.dropTable('wallets');
        await queryRunner.dropTable('users');
    }
}
//# sourceMappingURL=1700000000000-InitialSchema.js.map