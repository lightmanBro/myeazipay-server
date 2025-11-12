import dotenv from 'dotenv';
dotenv.config();
export const blockchainConfig = {
    alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
    etherscanApiKey: process.env.ETHERSCAN_API_KEY,
    defaultNetwork: process.env.DEFAULT_NETWORK || 'testnet',
    enforceTestnet: process.env.ENFORCE_TESTNET === 'true',
};
// Alchemy RPC URLs
export const getAlchemyRpcUrl = (network) => {
    const networkName = network === 'testnet' ? 'sepolia' : 'mainnet';
    return `https://eth-${networkName}.g.alchemy.com/v2/${blockchainConfig.alchemyApiKey}`;
};
// Etherscan API URLs
export const getEtherscanApiUrl = (network) => {
    const subdomain = network === 'testnet' ? 'api-sepolia' : 'api';
    return `https://${subdomain}.etherscan.io/api`;
};
//# sourceMappingURL=blockchain.js.map