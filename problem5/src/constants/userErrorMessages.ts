// User-related Error Messages Constants
export const USER_ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_USER_DATA: 'Invalid user data provided',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  DATABASE_ERROR: 'Database operation failed'
} as const;

export default USER_ERROR_MESSAGES;
