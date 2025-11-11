# GraphQL API Documentation

## Base URL

- **Development**: `http://localhost:4000/graphql`
- **Production**: `https://your-deployment-url/graphql`

## Authentication

All protected queries and mutations require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Schema Types

### Enums

#### Network
```graphql
enum Network {
  TESTNET
  MAINNET
}
```

#### TransactionStatus
```graphql
enum TransactionStatus {
  PENDING
  CONFIRMED
  FAILED
}
```

### Object Types

#### User
```graphql
type User {
  id: ID!
  email: String!
  wallets: [Wallet!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

#### Wallet
```graphql
type Wallet {
  id: ID!
  address: String!
  network: Network!
  createdAt: DateTime!
}
```

#### BalanceResponse
```graphql
type BalanceResponse {
  address: String!
  balance: String!
  balanceInWei: String!
  network: Network!
  lastUpdated: DateTime!
}
```

#### Transaction
```graphql
type Transaction {
  id: ID!
  transactionHash: String!
  from: String!
  to: String!
  amount: String!
  amountInEther: String!
  status: String!
  network: Network!
  blockNumber: Int
  gasUsed: String
  gasPrice: String
  createdAt: DateTime!
}
```

## Mutations

### register

Register a new user account.

**Arguments:**
- `email: String!` - User email address
- `password: String!` - User password (minimum 6 characters)

**Returns:** `AuthResponse` with token and user

**Example:**
```graphql
mutation {
  register(email: "user@example.com", password: "password123") {
    token
    user {
      id
      email
    }
  }
}
```

### login

Login with email and password.

**Arguments:**
- `email: String!` - User email address
- `password: String!` - User password

**Returns:** `AuthResponse` with token and user

**Example:**
```graphql
mutation {
  login(email: "user@example.com", password: "password123") {
    token
    user {
      id
      email
    }
  }
}
```

### createWallet

Create a new blockchain wallet.

**Arguments:**
- `network: Network!` - Network type (TESTNET or MAINNET)

**Returns:** `WalletResponse` with wallet details

**Example:**
```graphql
mutation {
  createWallet(network: TESTNET) {
    id
    address
    network
    createdAt
  }
}
```

**Note:** Requires authentication. Private key is encrypted and stored securely.

### sendFunds

Send funds from a wallet to another address.

**Arguments:**
- `to: String!` - Recipient wallet address
- `amount: String!` - Amount in Ether (e.g., "0.001")
- `network: Network!` - Network type
- `walletAddress: String!` - Sender wallet address

**Returns:** `TransactionResponse` with transaction details

**Example:**
```graphql
mutation {
  sendFunds(
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    amount: "0.001"
    network: TESTNET
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

**Note:** Requires authentication. Only testnet transactions are allowed by default.

## Queries

### me

Get current authenticated user information.

**Returns:** `User` object

**Example:**
```graphql
query {
  me {
    id
    email
    wallets {
      id
      address
      network
    }
  }
}
```

**Note:** Requires authentication.

### wallet

Get wallet by address.

**Arguments:**
- `address: String!` - Wallet address

**Returns:** `WalletResponse` or null

**Example:**
```graphql
query {
  wallet(address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb") {
    id
    address
    network
    createdAt
  }
}
```

**Note:** Requires authentication. Only returns wallets owned by the authenticated user.

### balance

Get wallet balance from blockchain.

**Arguments:**
- `address: String!` - Wallet address
- `network: Network!` - Network type

**Returns:** `BalanceResponse` with balance in Ether and Wei

**Example:**
```graphql
query {
  balance(address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", network: TESTNET) {
    address
    balance
    balanceInWei
    network
    lastUpdated
  }
}
```

**Note:** Requires authentication.

### transaction

Get transaction by hash.

**Arguments:**
- `hash: String!` - Transaction hash

**Returns:** `TransactionResponse` or null

**Example:**
```graphql
query {
  transaction(hash: "0x1234...") {
    transactionHash
    from
    to
    amount
    amountInEther
    status
    network
    blockNumber
  }
}
```

**Note:** Requires authentication.

### transactionHistory

Get transaction history for a wallet.

**Arguments:**
- `address: String!` - Wallet address
- `network: Network!` - Network type
- `limit: Int` - Maximum number of transactions (default: 10)

**Returns:** Array of `TransactionResponse`

**Example:**
```graphql
query {
  transactionHistory(
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    network: TESTNET
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

**Note:** Requires authentication.

## Error Codes

- `400` - Validation Error: Invalid input parameters
- `401` - Authentication Error: Invalid or missing token
- `403` - Authorization Error: Access denied
- `404` - Not Found: Resource not found
- `500` - Server Error: Internal server error or blockchain API error

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Applies to all GraphQL endpoints

