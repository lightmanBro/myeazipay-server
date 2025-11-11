import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { User } from './User';
import { Transaction } from './Transaction';

export enum Network {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

@Entity('wallets')
@Unique(['address', 'network', 'userId'])
export class Wallet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  address!: string;

  @Column('text')
  privateKeyEncrypted!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: Network.TESTNET,
  })
  network!: Network;

  @Column()
  @Index()
  userId!: number;

  @ManyToOne(() => User, (user) => user.wallets)
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

