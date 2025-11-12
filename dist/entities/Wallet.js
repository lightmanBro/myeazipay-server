var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index, Unique, } from 'typeorm';
import { User } from './User';
import { Transaction } from './Transaction';
export var Network;
(function (Network) {
    Network["TESTNET"] = "testnet";
    Network["MAINNET"] = "mainnet";
})(Network || (Network = {}));
let Wallet = class Wallet {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Wallet.prototype, "id", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", String)
], Wallet.prototype, "address", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Wallet.prototype, "privateKeyEncrypted", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 20,
        default: Network.TESTNET,
    }),
    __metadata("design:type", String)
], Wallet.prototype, "network", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", Number)
], Wallet.prototype, "userId", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.wallets),
    __metadata("design:type", User)
], Wallet.prototype, "user", void 0);
__decorate([
    OneToMany(() => Transaction, (transaction) => transaction.wallet),
    __metadata("design:type", Array)
], Wallet.prototype, "transactions", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Wallet.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Wallet.prototype, "updatedAt", void 0);
Wallet = __decorate([
    Entity('wallets'),
    Unique(['address', 'network', 'userId'])
], Wallet);
export { Wallet };
//# sourceMappingURL=Wallet.js.map