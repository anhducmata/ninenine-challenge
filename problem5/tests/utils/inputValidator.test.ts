import { InputValidator } from '../../src/utils/inputValidator';

describe('InputValidator', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'first.last+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(InputValidator.validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        '@domain.com',
        'user@',
        'user@domain',
        'user name@domain.com',
        'user@domain .com',
        'a'.repeat(250) + '@domain.com' // Too long
      ];

      invalidEmails.forEach(email => {
        expect(InputValidator.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      const validNames = [
        'John',
        'John Doe',
        'Mary-Jane',
        "O'Connor",
        'Jean-Luc',
        'Anna-Maria O\'Sullivan'
      ];

      validNames.forEach(name => {
        expect(InputValidator.validateName(name)).toBe(true);
      });
    });

    it('should reject invalid names', () => {
      const invalidNames = [
        '',
        '   ',
        'John123',
        'John@Doe',
        'John.Doe',
        'John_Doe',
        'a'.repeat(101), // Too long
        '!@#$%'
      ];

      invalidNames.forEach(name => {
        expect(InputValidator.validateName(name)).toBe(false);
      });
    });
  });

  describe('validateAge', () => {
    it('should validate correct ages', () => {
      const validAges = [0, 1, 25, 65, 100, 150];

      validAges.forEach(age => {
        expect(InputValidator.validateAge(age)).toBe(true);
      });
    });

    it('should reject invalid ages', () => {
      const invalidAges = [-1, 151, 25.5, NaN, Infinity, -Infinity];

      invalidAges.forEach(age => {
        expect(InputValidator.validateAge(age)).toBe(false);
      });
    });
  });

  describe('validateUserInput', () => {
    it('should return valid result for correct input', () => {
      const result = InputValidator.validateUserInput('John Doe', 'john@example.com', 30);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid input', () => {
      const result = InputValidator.validateUserInput('', 'invalid-email', -5);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Name must be 1-100 characters and contain only letters, spaces, hyphens, and apostrophes');
      expect(result.errors).toContain('Email must be a valid email address (max 254 characters)');
      expect(result.errors).toContain('Age must be an integer between 0 and 150');
    });

    it('should return specific errors for specific invalid fields', () => {
      const result = InputValidator.validateUserInput('John123', 'john@example.com', 30);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Name must be');
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace and limit length', () => {
      const input = '  test input  ';
      const sanitized = InputValidator.sanitizeString(input, 50);
      
      expect(sanitized).toBe('test input');
    });

    it('should truncate long input', () => {
      const longInput = 'a'.repeat(100);
      const sanitized = InputValidator.sanitizeString(longInput, 10);
      
      expect(sanitized).toHaveLength(10);
      expect(sanitized).toBe('a'.repeat(10));
    });

    it('should handle empty input', () => {
      const sanitized = InputValidator.sanitizeString('', 50);
      
      expect(sanitized).toBe('');
    });

    it('should handle non-string input', () => {
      const sanitized = InputValidator.sanitizeString(null as any, 50);
      
      expect(sanitized).toBe('');
    });
  });

  describe('validateId', () => {
    it('should validate positive integers correctly', () => {
      const result1 = InputValidator.validateId('123');
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe(123);

      const result2 = InputValidator.validateId('1');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe(1);

      const result3 = InputValidator.validateId(456);
      expect(result3.isValid).toBe(true);
      expect(result3.value).toBe(456);
    });

    it('should reject invalid IDs', () => {
      const invalidIds = [
        '0',        // Zero should be invalid
        '-5',       // Negative numbers
        'abc',      // Non-numeric
        '',         // Empty string
        '12a',      // Mixed alphanumeric (parseInt will parse to 12, but let's test anyway)
      ];

      invalidIds.forEach(id => {
        const result = InputValidator.validateId(id);
        expect(result.isValid).toBe(false);
        expect(result.value).toBeUndefined();
      });

      // Test null and undefined separately
      expect(InputValidator.validateId(null).isValid).toBe(false);
      expect(InputValidator.validateId(undefined).isValid).toBe(false);
      
      // Test very large numbers
      expect(InputValidator.validateId(Number.MAX_SAFE_INTEGER + 1).isValid).toBe(false);
    });

    it('should handle edge cases with parseInt behavior', () => {
      // Our new implementation rejects non-integer strings
      const result1 = InputValidator.validateId('12.3');
      expect(result1.isValid).toBe(false);

      const result2 = InputValidator.validateId('12a');
      expect(result2.isValid).toBe(false);

      // Leading zeros should be valid
      const result3 = InputValidator.validateId('00123');
      expect(result3.isValid).toBe(true);
      expect(result3.value).toBe(123);

      // Whitespace should be trimmed
      const result4 = InputValidator.validateId('  456  ');
      expect(result4.isValid).toBe(true);
      expect(result4.value).toBe(456);
    });
  });
});
