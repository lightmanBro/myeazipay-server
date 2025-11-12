"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAddress = isValidAddress;
exports.toChecksumAddress = toChecksumAddress;
exports.validateAndNormalizeAddress = validateAndNormalizeAddress;
const ethers_1 = require("ethers");
/**
 * Validates an Ethereum address format
 * @param address - The address to validate
 * @returns true if valid, false otherwise
 */
function isValidAddress(address) {
    try {
        return (0, ethers_1.isAddress)(address);
    }
    catch {
        return false;
    }
}
/**
 * Converts an address to checksum format (EIP-55)
 * @param address - The address to convert
 * @returns The checksummed address
 * @throws Error if address is invalid
 */
function toChecksumAddress(address) {
    if (!isValidAddress(address)) {
        throw new Error('Invalid Ethereum address');
    }
    return (0, ethers_1.getAddress)(address);
}
/**
 * Validates and normalizes an Ethereum address
 * @param address - The address to validate and normalize
 * @returns The checksummed address
 * @throws Error if address is invalid
 */
function validateAndNormalizeAddress(address) {
    if (!address || typeof address !== 'string') {
        throw new Error('Address must be a non-empty string');
    }
    return toChecksumAddress(address);
}
//# sourceMappingURL=addressValidation.js.map