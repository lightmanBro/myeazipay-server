import dotenv from 'dotenv';

dotenv.config();

export interface BlockchainConfig {
  alchemyApiKey: string;
  etherscanApiKey?: string;
  defaultNetwork: 'testnet' | 'mainnet';
  enforceTestnet: boolean;
}

export const blockchainConfig: BlockchainConfig = {
  alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
  etherscanApiKey: process.env.ETHERSCAN_API_KEY,
  defaultNetwork: (process.env.DEFAULT_NETWORK as 'testnet' | 'mainnet') || 'testnet',
  enforceTestnet: process.env.ENFORCE_TESTNET === 'true',
};

// Alchemy RPC URLs
export const getAlchemyRpcUrl = (network: 'testnet' | 'mainnet'): string => {
  const networkName = network === 'testnet' ? 'sepolia' : 'mainnet';
  return `https://eth-${networkName}.g.alchemy.com/v2/${blockchainConfig.alchemyApiKey}`;
};

// Etherscan API URLs
export const getEtherscanApiUrl = (network: 'testnet' | 'mainnet'): string => {
  const subdomain = network === 'testnet' ? 'api-sepolia' : 'api';
  return `https://${subdomain}.etherscan.io/api`;
};

