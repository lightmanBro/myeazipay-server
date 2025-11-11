import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Wallet, Network } from './Wallet';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @Index()
  hash!: string;

  @Column()
  @Index()
  fromAddress!: string;

  @Column()
  toAddress!: string;

  @Column('decimal', { precision: 36, scale: 18 })
  amount!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({
    type: 'varchar',
    length: 20,
  })
  network!: Network;

  @Column({ nullable: true })
  blockNumber?: number;

  @Column('decimal', { precision: 36, scale: 18, nullable: true })
  gasUsed?: string;

  @Column('decimal', { precision: 36, scale: 18, nullable: true })
  gasPrice?: string;

  @Column()
  walletId!: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet!: Wallet;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

