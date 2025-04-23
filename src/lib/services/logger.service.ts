/* eslint-disable no-console */
import { env } from 'process';

class Logger {
  private isDevelopment = env.NODE_ENV === 'development';

  private log(level: 'debug' | 'info' | 'warn' | 'error', ...args: unknown[]): void {
    if ((level === 'debug' || level === 'info') && !this.isDevelopment) {
      return;
    }

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

export const logger = new Logger(); 