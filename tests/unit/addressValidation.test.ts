import { isValidAddress, toChecksumAddress, validateAndNormalizeAddress } from '../../src/utils/addressValidation';

describe('Address Validation', () => {
  const validAddress = '0xB7ae9D056f2c352df7Bf22F83FD6F2C943f221f6';
  const invalidAddress = '0xinvalid';

  describe('isValidAddress', () => {
    it('should return true for valid address', () => {
      expect(isValidAddress(validAddress)).toBe(true);
    });

    it('should return false for invalid address', () => {
      expect(isValidAddress(invalidAddress)).toBe(false);
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('not-an-address')).toBe(false);
    });
  });

  describe('toChecksumAddress', () => {
    it('should convert address to checksum format', () => {
      const checksummed = toChecksumAddress(validAddress.toLowerCase());
      expect(checksummed).toBe(validAddress);
    });

    it('should throw error for invalid address', () => {
      expect(() => toChecksumAddress(invalidAddress)).toThrow();
    });
  });

  describe('validateAndNormalizeAddress', () => {
    it('should validate and normalize address', () => {
      const normalized = validateAndNormalizeAddress(validAddress.toLowerCase());
      expect(normalized).toBe(validAddress);
    });

    it('should throw error for invalid address', () => {
      expect(() => validateAndNormalizeAddress(invalidAddress)).toThrow();
      expect(() => validateAndNormalizeAddress('')).toThrow();
    });
  });
});

