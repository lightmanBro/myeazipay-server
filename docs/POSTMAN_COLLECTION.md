# Postman Collection Examples

## Setup

1. Import this collection into Postman
2. Set the `baseUrl` variable to your GraphQL endpoint (e.g., `http://localhost:4000/graphql`)
3. Set the `token` variable after logging in

## Example Queries and Mutations

### 1. Register User

**Mutation:**
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

**Headers:**
- Content-Type: application/json

**Response:**
```json
{
  "data": {
    "register": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "user@example.com"
      }
    }
  }
}
```

### 2. Login

**Mutation:**
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

**Headers:**
- Content-Type: application/json

### 3. Create Wallet

**Mutation:**
```graphql
mutation CreateWallet {
  createWallet(network: TESTNET) {
    id
    address
    network
    createdAt
  }
}
```

**Headers:**
- Content-Type: application/json
- Authorization: Bearer {{token}}

### 4. Get Balance

**Query:**
```graphql
query GetBalance {
  balance(address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", network: TESTNET) {
    address
    balance
    balanceInWei
    network
    lastUpdated
  }
}
```

**Headers:**
- Content-Type: application/json
- Authorization: Bearer {{token}}

### 5. Send Funds

**Mutation:**
```graphql
mutation SendFunds {
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

**Headers:**
- Content-Type: application/json
- Authorization: Bearer {{token}}

### 6. Get Transaction History

**Query:**
```graphql
query GetTransactionHistory {
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

**Headers:**
- Content-Type: application/json
- Authorization: Bearer {{token}}

### 7. Get Current User

**Query:**
```graphql
query Me {
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

**Headers:**
- Content-Type: application/json
- Authorization: Bearer {{token}}

## Postman Collection JSON

You can import this into Postman:

```json
{
  "info": {
    "name": "Mini Wallet API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:4000/graphql",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "graphql",
          "graphql": {
            "query": "mutation Register($email: String!, $password: String!) {\n  register(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n    }\n  }\n}",
            "variables": {
              "email": "user@example.com",
              "password": "password123"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}",
          "host": ["{{baseUrl}}"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "graphql",
          "graphql": {
            "query": "mutation Login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n    }\n  }\n}",
            "variables": {
              "email": "user@example.com",
              "password": "password123"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}",
          "host": ["{{baseUrl}}"]
        }
      }
    },
    {
      "name": "Create Wallet",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "graphql",
          "graphql": {
            "query": "mutation CreateWallet($network: Network!) {\n  createWallet(network: $network) {\n    id\n    address\n    network\n    createdAt\n  }\n}",
            "variables": {
              "network": "TESTNET"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}",
          "host": ["{{baseUrl}}"]
        }
      }
    }
  ]
}
```

