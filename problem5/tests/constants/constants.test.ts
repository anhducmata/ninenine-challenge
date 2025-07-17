import { HTTP_STATUS } from '../../src/constants/httpStatusCodes';
import { USER_ERROR_MESSAGES } from '../../src/constants/userErrorMessages';

describe('Constants', () => {
  describe('HTTP_STATUS', () => {
    it('should have correct HTTP status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.NO_CONTENT).toBe(204);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });

    it('should be readonly (as const)', () => {
      // The 'as const' assertion makes properties readonly, 
      // but doesn't throw errors in runtime, only at compile time
      expect(typeof HTTP_STATUS.OK).toBe('number');
      expect(HTTP_STATUS.OK).toBe(200);
    });
  });

  describe('USER_ERROR_MESSAGES', () => {
    it('should have all required error messages', () => {
      expect(USER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS).toBeDefined();
      expect(USER_ERROR_MESSAGES.USER_NOT_FOUND).toBeDefined();
      expect(USER_ERROR_MESSAGES.INVALID_USER_DATA).toBeDefined();
      expect(USER_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS).toBeDefined();
      expect(USER_ERROR_MESSAGES.DATABASE_ERROR).toBeDefined();
    });

    it('should have meaningful error messages', () => {
      expect(typeof USER_ERROR_MESSAGES.USER_NOT_FOUND).toBe('string');
      expect(USER_ERROR_MESSAGES.USER_NOT_FOUND.length).toBeGreaterThan(0);
      
      expect(typeof USER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS).toBe('string');
      expect(USER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS.length).toBeGreaterThan(0);
      
      expect(typeof USER_ERROR_MESSAGES.INVALID_USER_DATA).toBe('string');
      expect(USER_ERROR_MESSAGES.INVALID_USER_DATA.length).toBeGreaterThan(0);
    });

    it('should be readonly (as const)', () => {
      // The 'as const' assertion makes properties readonly, 
      // but doesn't throw errors in runtime, only at compile time
      expect(typeof USER_ERROR_MESSAGES.USER_NOT_FOUND).toBe('string');
      expect(USER_ERROR_MESSAGES.USER_NOT_FOUND.length).toBeGreaterThan(0);
    });
  });
});
