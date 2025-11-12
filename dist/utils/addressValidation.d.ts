/**
 * Validates an Ethereum address format
 * @param address - The address to validate
 * @returns true if valid, false otherwise
 */
export declare function isValidAddress(address: string): boolean;
/**
 * Converts an address to checksum format (EIP-55)
 * @param address - The address to convert
 * @returns The checksummed address
 * @throws Error if address is invalid
 */
export declare function toChecksumAddress(address: string): string;
/**
 * Validates and normalizes an Ethereum address
 * @param address - The address to validate and normalize
 * @returns The checksummed address
 * @throws Error if address is invalid
 */
export declare function validateAndNormalizeAddress(address: string): string;
//# sourceMappingURL=addressValidation.d.ts.map