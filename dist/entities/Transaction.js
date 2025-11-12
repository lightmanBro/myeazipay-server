var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index, } from 'typeorm';
import { Wallet, Network } from './Wallet';
export var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["CONFIRMED"] = "confirmed";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (TransactionStatus = {}));
let Transaction = class Transaction {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    Column({ unique: true }),
    Index(),
    __metadata("design:type", String)
], Transaction.prototype, "hash", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", String)
], Transaction.prototype, "fromAddress", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Transaction.prototype, "toAddress", void 0);
__decorate([
    Column('decimal', { precision: 36, scale: 18 }),
    __metadata("design:type", String)
], Transaction.prototype, "amount", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 20,
        default: TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 20,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "network", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "blockNumber", void 0);
__decorate([
    Column('decimal', { precision: 36, scale: 18, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "gasUsed", void 0);
__decorate([
    Column('decimal', { precision: 36, scale: 18, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "gasPrice", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Transaction.prototype, "walletId", void 0);
__decorate([
    ManyToOne(() => Wallet, (wallet) => wallet.transactions),
    __metadata("design:type", Wallet)
], Transaction.prototype, "wallet", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
Transaction = __decorate([
    Entity('transactions')
], Transaction);
export { Transaction };
//# sourceMappingURL=Transaction.js.map