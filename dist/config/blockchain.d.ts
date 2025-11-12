export interface BlockchainConfig {
    alchemyApiKey: string;
    etherscanApiKey?: string;
    defaultNetwork: 'testnet' | 'mainnet';
    enforceTestnet: boolean;
}
export declare const blockchainConfig: BlockchainConfig;
export declare const getAlchemyRpcUrl: (network: "testnet" | "mainnet") => string;
export declare const getEtherscanApiUrl: (network: "testnet" | "mainnet") => string;
//# sourceMappingURL=blockchain.d.ts.map