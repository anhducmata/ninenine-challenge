// Error Handler Aspect - Handles error mapping and standardization
import { USER_ERROR_MESSAGES } from '../constants/userErrorMessages';

export class ErrorHandler {
  static handleDatabaseError(error: any, operation: string): never {
    console.error(`Database error during ${operation}:`, error);
    
    // Map specific database errors to user-friendly messages
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      throw new Error(USER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }
    
    // Map operation to appropriate error message
    const errorMap: Record<string, string> = {
      'fetch_users': USER_ERROR_MESSAGES.FAILED_TO_FETCH_USERS,
      'fetch_user': USER_ERROR_MESSAGES.FAILED_TO_FETCH_USER,
      'check_email': USER_ERROR_MESSAGES.FAILED_TO_CHECK_EMAIL,
      'create_user': USER_ERROR_MESSAGES.FAILED_TO_CREATE_USER,
      'update_user': USER_ERROR_MESSAGES.FAILED_TO_UPDATE_USER,
      'delete_user': USER_ERROR_MESSAGES.FAILED_TO_DELETE_USER,
      'filter_users': USER_ERROR_MESSAGES.FAILED_TO_FILTER_USERS,
      'get_stats': USER_ERROR_MESSAGES.FAILED_TO_GET_USER_STATISTICS,
    };
    
    const errorMessage = errorMap[operation] || USER_ERROR_MESSAGES.DATABASE_ERROR;
    throw new Error(errorMessage);
  }
}
