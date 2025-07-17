// Input validation utilities for AOP
import { USER_ERROR_MESSAGES } from '../constants/userErrorMessages';

export class ValidationRules {
  static validateUserCreation(name: string, email: string, age: number): boolean | string {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return 'Name is required and must be a non-empty string';
    }
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return 'Valid email is required';
    }
    
    if (typeof age !== 'number' || age < 0 || age > 150) {
      return 'Age must be a number between 0 and 150';
    }
    
    return true;
  }

  static validateUserUpdate(id: number, name: string, email: string, age: number): boolean | string {
    if (typeof id !== 'number' || id <= 0) {
      return 'Valid user ID is required';
    }
    
    return ValidationRules.validateUserCreation(name, email, age);
  }

  static validateUserId(id: number): boolean | string {
    if (typeof id !== 'number' || id <= 0) {
      return 'Valid user ID is required';
    }
    
    return true;
  }

  static validateEmail(email: string): boolean | string {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return 'Valid email is required';
    }
    
    return true;
  }
}
