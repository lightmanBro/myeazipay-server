# Mini Blockchain Wallet Application - Backend Service

A production-grade Mini Wallet Application that integrates with public blockchain APIs (Alchemy/Etherscan), supports wallet operations via GraphQL, and includes comprehensive testing, security, and deployment.

## Features

- **Create Wallet** - Generate wallet address and private key using ethers.js
- **Check Balance** - Fetch current wallet balance from blockchain API
- **Send Funds** - Transfer funds to another wallet address (testnet only)
- **Transaction History** - Fetch and display recent transactions from blockchain

## Tech Stack

- **Backend**: Node.js + TypeScript
- **Framework**: Express.js
- **GraphQL**: Apollo Server with type-graphql
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: ethers.js for Ethereum operations
- **APIs**: Alchemy API (primary), Etherscan API (alternative)
- **Security**: JWT authentication, bcrypt password hashing, AES-256-GCM encryption
- **Testing**: Jest with 70%+ coverage requirement

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd myeazipay/wallet-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=wallet_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Encryption Key (32 bytes for AES-256)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-32-byte-encryption-key-change-in-production

# Blockchain API Keys
ALCHEMY_API_KEY=your-alchemy-api-key
ETHERSCAN_API_KEY=your-etherscan-api-key-optional

# Network Configuration
DEFAULT_NETWORK=testnet
ENFORCE_TESTNET=true

# Server Configuration
PORT=4000
NODE_ENV=development
```

### 4. Set up PostgreSQL database

```bash
# Create database
createdb wallet_db

# Or using psql
psql -U postgres
CREATE DATABASE wallet_db;
```

### 5. Run database migrations

```bash
npm run migration:run
```

### 6. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:4000` and GraphQL Playground will be available at `http://localhost:4000/graphql`.

## API Documentation

### GraphQL Endpoint

- **URL**: `http://localhost:4000/graphql`
- **Playground**: Available in development mode at the same URL

### Authentication

All protected queries and mutations require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Queries and Mutations

#### Register User

```graphql
mutation Register {
  register(email: "user@example.com", password: "password123") {
    token
    user {
      id
      email
    }
  }
}
```

#### Login

```graphql
mutation Login {
  login(email: "user@example.com", password: "password123") {
    token
    user {
      id
      email
    }
  }
}
```

#### Create Wallet

```graphql
mutation CreateWallet {
  createWallet(network: testnet) {
    id
    address
    network
    createdAt
  }
}
```

#### Check Balance

```graphql
query GetBalance {
  balance(address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", network: testnet) {
    address
    balance
    balanceInWei
    network
    lastUpdated
  }
}
```

#### Send Funds

```graphql
mutation SendFunds {
  sendFunds(
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    amount: "0.001"
    network: testnet
    walletAddress: "0xYourWalletAddress"
  ) {
    transactionHash
    from
    to
    amount
    amountInEther
    status
    network
  }
}
```

#### Get Transaction History

```graphql
query GetTransactionHistory {
  transactionHistory(
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    network: testnet
    limit: 10
  ) {
    hash
    from
    to
    amount
    amountInEther
    status
    blockNumber
    createdAt
  }
}
```

## Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm run test:coverage
```

Coverage threshold: 70% minimum for statements, branches, functions, and lines.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Using Docker

```bash
docker-compose up -d
```

### Manual Deployment

1. Set `NODE_ENV=production` in environment variables
2. Build the application: `npm run build`
3. Start the server: `npm start`

## Architecture Decisions

1. **GraphQL over REST**: Provides flexible querying and better type safety
2. **ethers.js over web3.js**: Better TypeScript support and modern API
3. **Alchemy API as primary**: Better free tier and testnet support
4. **AES-256-GCM encryption**: Industry-standard authenticated encryption for private keys
5. **TypeORM**: Type-safe ORM with excellent TypeScript support
6. **Testnet enforcement**: Prevents accidental mainnet transactions

## Security Features

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Private key encryption with AES-256-GCM
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- Input validation on all endpoints
- Audit Logs of activities on the server.
- ACID Compliance for writing to the on wallet transcations
- CORS configuration

## License

ISC

