// User-related Error Messages Constants
export const USER_ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_USER_DATA: 'Invalid user data provided',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  DATABASE_ERROR: 'Database operation failed',
  FAILED_TO_FETCH_USERS: 'Failed to fetch users',
  FAILED_TO_FETCH_USER: 'Failed to fetch user',
  FAILED_TO_CHECK_EMAIL: 'Failed to check email',
  FAILED_TO_CREATE_USER: 'Failed to create user',
  FAILED_TO_UPDATE_USER: 'Failed to update user',
  FAILED_TO_DELETE_USER: 'Failed to delete user',
  FAILED_TO_FILTER_USERS: 'Failed to filter users',
  FAILED_TO_GET_USER_STATISTICS: 'Failed to get user statistics'
} as const;

export default USER_ERROR_MESSAGES;
