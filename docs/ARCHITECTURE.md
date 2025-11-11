# Architecture Documentation

## System Overview

The Mini Blockchain Wallet Application is a GraphQL-based backend service that provides wallet management and blockchain transaction capabilities. It integrates with public blockchain APIs (Alchemy/Etherscan) to interact with the Ethereum blockchain.

## Architecture Layers

### 1. Presentation Layer (GraphQL)

- **Apollo Server**: GraphQL server implementation
- **Type-GraphQL**: Decorator-based schema definition
- **Resolvers**: Handle GraphQL queries and mutations
  - `UserResolver`: Authentication and user management
  - `WalletResolver`: Wallet operations
  - `TransactionResolver`: Transaction operations

### 2. Business Logic Layer (Services)

- **WalletService**: Wallet creation, encryption, balance checking
- **TransactionService**: Transaction signing, broadcasting, history
- **BlockchainService**: Blockchain API integration (Alchemy/Etherscan)
- **EncryptionService**: Private key encryption/decryption

### 3. Data Access Layer (TypeORM)

- **Entities**: Database models
  - `User`: User accounts
  - `Wallet`: Wallet information with encrypted private keys
  - `Transaction`: Transaction records
- **Repositories**: TypeORM repositories for database operations

### 4. Infrastructure Layer

- **Database**: PostgreSQL for data persistence
- **Blockchain APIs**: Alchemy (primary), Etherscan (alternative)
- **Security**: JWT, bcrypt, AES-256-GCM encryption

## Data Flow

### Wallet Creation Flow

1. User requests wallet creation via GraphQL mutation
2. `WalletResolver` validates request and checks authentication
3. `WalletService.createWallet()`:
   - Generates wallet using `ethers.Wallet.createRandom()`
   - Encrypts private key using `EncryptionService`
   - Saves wallet to database (without exposing private key)
4. Returns wallet address to user

### Send Funds Flow

1. User requests fund transfer via GraphQL mutation
2. `TransactionResolver` validates request and checks wallet ownership
3. `TransactionService.sendFunds()`:
   - Validates addresses and amount
   - Checks wallet balance
   - Retrieves and decrypts private key
   - Creates transaction with ethers.js
   - Signs transaction with private key
   - Broadcasts to blockchain via `BlockchainService`
   - Saves transaction to database
   - Polls for confirmation
4. Returns transaction hash

### Balance Check Flow

1. User requests balance via GraphQL query
2. `WalletResolver` validates request
3. `WalletService.getBalance()`:
   - Calls `BlockchainService.getBalance()`
   - Converts Wei to Ether
4. Returns formatted balance

## Security Architecture

### Private Key Security

1. **Encryption**: AES-256-GCM with random IV
2. **Storage**: Encrypted private keys stored in database
3. **Memory**: Private keys decrypted only when needed, cleared immediately after use
4. **Logging**: Private keys never logged (even encrypted)

### Authentication & Authorization

1. **JWT Tokens**: Stateless authentication
2. **Password Hashing**: bcrypt with 12 rounds
3. **Authorization**: Wallet ownership verification before operations
4. **Rate Limiting**: 100 requests per 15 minutes per IP

### Network Security

1. **Helmet.js**: Security headers
2. **CORS**: Configured for frontend origin
3. **Input Validation**: All inputs validated and sanitized
4. **Testnet Enforcement**: Prevents accidental mainnet transactions

## Database Schema

```
User
  ├── id (PK)
  ├── email (unique)
  ├── passwordHash
  └── wallets (OneToMany)

Wallet
  ├── id (PK)
  ├── address (indexed, unique per user+network)
  ├── privateKeyEncrypted
  ├── network (enum)
  ├── userId (FK)
  └── transactions (OneToMany)

Transaction
  ├── id (PK)
  ├── hash (unique, indexed)
  ├── fromAddress (indexed)
  ├── toAddress
  ├── amount
  ├── status (enum)
  ├── network (enum)
  ├── blockNumber
  ├── gasUsed
  ├── gasPrice
  └── walletId (FK)
```

## Blockchain Integration

### Alchemy API (Primary)

- **RPC Endpoint**: `https://eth-sepolia.g.alchemy.com/v2/{API_KEY}`
- **Methods Used**:
  - `eth_getBalance`: Get wallet balance
  - `eth_getTransactionCount`: Get nonce
  - `eth_gasPrice`: Get current gas price
  - `eth_sendRawTransaction`: Broadcast signed transaction
  - `eth_getTransactionReceipt`: Get transaction confirmation

### Etherscan API (Alternative)

- **Endpoint**: `https://api-sepolia.etherscan.io/api`
- **Methods Used**:
  - `account/balance`: Get wallet balance
  - `account/txlist`: Get transaction history

## Error Handling

### Error Classes

- `AppError`: Base error class
- `ValidationError`: Input validation errors (400)
- `AuthenticationError`: Authentication failures (401)
- `AuthorizationError`: Access denied (403)
- `NotFoundError`: Resource not found (404)
- `BlockchainError`: Blockchain API errors (500)

### Error Flow

1. Service throws `AppError` or standard `Error`
2. GraphQL resolver catches and formats error
3. Error handler middleware formats response
4. Client receives structured error response

## Testing Strategy

### Unit Tests

- Service layer tests with mocked dependencies
- Utility function tests
- Encryption/decryption tests

### Integration Tests

- GraphQL resolver tests
- Database integration tests
- End-to-end wallet operations

### Coverage Requirements

- Minimum 70% coverage for:
  - Statements
  - Branches
  - Functions
  - Lines

## Deployment Architecture

### Development

- Local PostgreSQL database
- Development server with hot-reload
- GraphQL Playground enabled

### Production

- Docker containerization
- Managed PostgreSQL database
- Environment-based configuration
- Health check endpoints
- CI/CD pipeline with automated testing

## Performance Considerations

1. **Database Indexing**: Indexes on frequently queried fields
2. **Connection Pooling**: TypeORM connection pooling
3. **Rate Limiting**: Prevents API abuse
4. **Caching**: Future enhancement for balance queries

## Future Enhancements

1. Redis caching for balance queries
2. WebSocket support for real-time updates
3. Transaction status polling improvements
4. Multi-chain support (beyond Ethereum)
5. Advanced transaction history with pagination

