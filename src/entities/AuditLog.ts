import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  WALLET_CREATE = 'wallet_create',
  TRANSACTION_SEND = 'transaction_send',
  TRANSACTION_CONFIRM = 'transaction_confirm',
  TRANSACTION_FAIL = 'transaction_fail',
  BALANCE_CHECK = 'balance_check',
  WALLET_ACCESS = 'wallet_access',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  @Index()
  action!: AuditAction;

  @Column({
    type: 'varchar',
    length: 20,
  })
  status!: AuditStatus;

  @Column({ nullable: true })
  @Index()
  userId?: number;

  @Column({ nullable: true })
  walletAddress?: string;

  @Column({ nullable: true })
  transactionHash?: string;

  @Column('text', { nullable: true })
  metadata?: string; // JSON string for additional data

  @Column('text', { nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;
}
