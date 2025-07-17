// Input validation and sanitization utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class InputValidator {
  // Email validation with regex
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
  }

  // Name validation (no special characters that could be problematic)
  static validateName(name: string): boolean {
    if (!name || name.trim().length === 0) return false;
    if (name.length > 100) return false; // Reasonable limit
    
    // Allow letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(name.trim());
  }

  // Age validation
  static validateAge(age: number): boolean {
    return Number.isInteger(age) && age >= 0 && age <= 150;
  }

  // Comprehensive user input validation
  static validateUserInput(name: string, email: string, age: number): ValidationResult {
    const errors: string[] = [];

    if (!this.validateName(name)) {
      errors.push('Name must be 1-100 characters and contain only letters, spaces, hyphens, and apostrophes');
    }

    if (!this.validateEmail(email)) {
      errors.push('Email must be a valid email address (max 254 characters)');
    }

    if (!this.validateAge(age)) {
      errors.push('Age must be an integer between 0 and 150');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitize string input (trim whitespace, limit length)
  static sanitizeString(input: string, maxLength: number = 255): string {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength);
  }

  // Sanitize and validate ID parameters
  static validateId(id: any): { isValid: boolean; value?: number } {
    // Check if input is null or undefined
    if (id === null || id === undefined) {
      return { isValid: false };
    }
    
    // Convert to string and check if it's a valid integer string
    const idStr = String(id).trim();
    
    // Check if the string contains only digits (and optional leading/trailing whitespace)
    if (!/^\d+$/.test(idStr)) {
      return { isValid: false };
    }
    
    const numericId = parseInt(idStr, 10);
    if (isNaN(numericId) || numericId <= 0 || numericId > Number.MAX_SAFE_INTEGER) {
      return { isValid: false };
    }
    return { isValid: true, value: numericId };
  }
}

export default InputValidator;
