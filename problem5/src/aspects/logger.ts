// Logger Aspect - Handles logging cross-cutting concern
export class Logger {
  static log(level: 'info' | 'error' | 'warn', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      default:
        console.log(logMessage, data || '');
    }
  }

  static info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  static error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  static warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
}
