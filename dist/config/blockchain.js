"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEtherscanApiUrl = exports.getAlchemyRpcUrl = exports.blockchainConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.blockchainConfig = {
    alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
    etherscanApiKey: process.env.ETHERSCAN_API_KEY,
    defaultNetwork: process.env.DEFAULT_NETWORK || 'testnet',
    enforceTestnet: process.env.ENFORCE_TESTNET === 'true',
};
// Alchemy RPC URLs
const getAlchemyRpcUrl = (network) => {
    const networkName = network === 'testnet' ? 'sepolia' : 'mainnet';
    return `https://eth-${networkName}.g.alchemy.com/v2/${exports.blockchainConfig.alchemyApiKey}`;
};
exports.getAlchemyRpcUrl = getAlchemyRpcUrl;
// Etherscan API URLs
const getEtherscanApiUrl = (network) => {
    const subdomain = network === 'testnet' ? 'api-sepolia' : 'api';
    return `https://${subdomain}.etherscan.io/api`;
};
exports.getEtherscanApiUrl = getEtherscanApiUrl;
//# sourceMappingURL=blockchain.js.map