# Setup Instructions

## Prerequisites

- Node.js v18 or higher
- PostgreSQL v12 or higher
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd wallet-service
npm install
```

### 2. Set Up PostgreSQL Database

Make sure PostgreSQL is running on localhost with:
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

Create the database:
```bash
createdb wallet_db
```

Or using psql:
```sql
psql -U postgres
CREATE DATABASE wallet_db;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `JWT_SECRET`: Generate a secure random string
- `ENCRYPTION_KEY`: Generate a 32-byte key:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `ALCHEMY_API_KEY`: Get from https://www.alchemy.com/ (free tier available)
- `ETHERSCAN_API_KEY`: Optional, get from https://etherscan.io/apis

### 4. Run Database Migrations

```bash
npm run migration:run
```

Or in development, TypeORM will auto-sync the schema.

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:4000`
GraphQL Playground: `http://localhost:4000/graphql`

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Building for Production

```bash
npm run build
npm start
```

## Using Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f wallet-service

# Stop services
docker-compose down
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Blockchain API Issues

- Verify `ALCHEMY_API_KEY` is set correctly
- Check API key is valid and has remaining quota
- Ensure network is set to `testnet` for testing

### Port Already in Use

- Change `PORT` in `.env` file
- Or kill the process using port 4000:
  ```bash
  lsof -ti:4000 | xargs kill
  ```

