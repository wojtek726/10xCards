/* eslint-disable no-console */

/**
 * Simple logger utility that suppresses debug and info logs in production
 */
class Logger {
  private isDevelopment: boolean;

  constructor(isDevelopment?: boolean) {
    // Try to determine development mode from NODE_ENV if not explicitly provided
    if (isDevelopment === undefined) {
      try {
        this.isDevelopment = process.env.NODE_ENV !== 'production';
      } catch (e) {
        // Default to true if environment detection fails
        this.isDevelopment = true;
      }
    } else {
      this.isDevelopment = isDevelopment;
    }
  }

  /**
   * Set development mode
   */
  setDevelopmentMode(isDevelopment: boolean): void {
    this.isDevelopment = isDevelopment;
  }

  /**
   * Internal logging method
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', ...args: unknown[]): void {
    // Skip debug and info logs in production
    if ((level === 'debug' || level === 'info') && !this.isDevelopment) {
      return;
    }

    // Log with appropriate console method
    switch (level) {
      case 'debug':
        console.debug(`[${level.toUpperCase()}]`, ...args);
        break;
      case 'info':
        console.info(`[${level.toUpperCase()}]`, ...args);
        break;
      case 'warn':
        console.warn(`[${level.toUpperCase()}]`, ...args);
        break;
      case 'error':
        console.error(`[${level.toUpperCase()}]`, ...args);
        break;
    }
  }

  debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  error(...args: unknown[]): void {
    this.log('error', ...args);
  }
}

// Export a singleton instance - development mode will be determined by environment
export const logger = new Logger(); 