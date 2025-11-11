# Quick Start Guide - Wallet Service

Get the wallet service up and running in 5 minutes!

## Prerequisites

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **PostgreSQL** (v12 or higher)
   ```bash
   psql --version  # Should be v12+
   ```

3. **npm** or **yarn**

## Quick Setup (5 Steps)

### Step 1: Install Dependencies

```bash
cd wallet-service
npm install
```

### Step 2: Set Up PostgreSQL Database

Make sure PostgreSQL is running, then create the database:

```bash
# Option 1: Using createdb command
createdb wallet_db

# Option 2: Using psql
psql -U postgres -c "CREATE DATABASE wallet_db;"
```

**Default PostgreSQL credentials:**
- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `wallet_db`

### Step 3: Create Environment Variables File

Create a `.env` file in the `wallet-service` directory:

```bash
cd wallet-service
touch .env
```

Add the following content to `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=wallet_db

# JWT Configuration (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Encryption Key (32 bytes - REQUIRED for wallet operations)
# Generate with this command:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-32-byte-encryption-key-change-in-production

# Blockchain API Keys (REQUIRED)
# Get free API key from: https://www.alchemy.com/
ALCHEMY_API_KEY=your-alchemy-api-key-here

# Optional: For better transaction history
# Get from: https://etherscan.io/apis
ETHERSCAN_API_KEY=your-etherscan-api-key-optional

# Network Configuration
DEFAULT_NETWORK=testnet
ENFORCE_TESTNET=true

# Server Configuration
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Important:** Generate secure values for:
- `JWT_SECRET`: Any random string (e.g., `openssl rand -hex 32`)
- `ENCRYPTION_KEY`: Must be exactly 32 bytes (64 hex characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Step 4: Get Alchemy API Key (Required)

1. Go to https://www.alchemy.com/
2. Sign up for a free account
3. Create a new app
4. Select "Ethereum" → "Sepolia" (testnet)
5. Copy your API key
6. Paste it into `.env` as `ALCHEMY_API_KEY`

### Step 5: Start the Server

```bash
npm run dev
```

The server will:
- Connect to PostgreSQL
- Auto-sync database schema (in development)
- Start on `http://localhost:4000`
- GraphQL Playground available at `http://localhost:4000/graphql`

## Verify It's Working

1. Open GraphQL Playground: http://localhost:4000/graphql
2. Try registering a user:

```graphql
mutation {
  register(email: "test@example.com", password: "Test123!@#") {
    token
    user {
      id
      email
    }
  }
}
```

## Using Docker (Alternative)

If you prefer Docker:

```bash
# From project root
docker-compose up -d
```

This will start PostgreSQL and the wallet service automatically.

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_isready

# Check if database exists
psql -U postgres -l | grep wallet_db
```

### Missing API Key
- Make sure `ALCHEMY_API_KEY` is set in `.env`
- Verify the API key is valid at https://dashboard.alchemy.com/

### Port Already in Use
```bash
# Change PORT in .env or kill the process
lsof -ti:4000 | xargs kill
```

### Encryption Key Error
- Must be exactly 32 bytes (64 hex characters)
- Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Next Steps

- Read the [API Documentation](./docs/API.md) for GraphQL queries and mutations
- Check [Architecture Documentation](./docs/ARCHITECTURE.md) for system design
- Run tests: `npm test`
- View test coverage: `npm run test:coverage`

