// Method Decorators for AOP - Cross-cutting concerns as decorators
import { Logger } from './logger';
import { ErrorHandler } from './errorHandler';

// Logging decorator - automatically logs method entry/exit
export function LogMethod(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const className = target.constructor.name;
    const methodName = propertyName;
    
    Logger.info(`Entering ${className}.${methodName}`, { args: args.length > 0 ? 'with arguments' : 'no arguments' });
    
    try {
      const result = await method.apply(this, args);
      Logger.info(`Exiting ${className}.${methodName}`, { success: true });
      return result;
    } catch (error) {
      Logger.error(`Error in ${className}.${methodName}`, error);
      throw error;
    }
  };
}

// Error handling decorator - automatically handles and maps errors
export function HandleErrors(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        ErrorHandler.handleDatabaseError(error, operation);
      }
    };
  };
}

// Performance monitoring decorator
export function Monitor(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    const className = target.constructor.name;
    const methodName = propertyName;
    
    try {
      const result = await method.apply(this, args);
      const duration = Date.now() - startTime;
      Logger.info(`Performance: ${className}.${methodName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.warn(`Performance: ${className}.${methodName} failed after ${duration}ms`);
      throw error;
    }
  };
}

// Validation decorator - validates input parameters
export function ValidateInput(validationFn: (...args: any[]) => boolean | string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const validationResult = validationFn(...args);
      
      if (validationResult !== true) {
        const errorMessage = typeof validationResult === 'string' 
          ? validationResult 
          : 'Invalid input parameters';
        Logger.error(`Validation failed for ${target.constructor.name}.${propertyName}`, { error: errorMessage });
        throw new Error(errorMessage);
      }
      
      return await method.apply(this, args);
    };
  };
}
