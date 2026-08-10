/**
 * Structured Logging Utility
 * Provides consistent, production-ready logging across the application
 * with different severity levels (debug, info, warn, error)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatLog(entry: LogEntry): string {
    const formatted = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(formatted);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
          code: (error as any).code,
        },
      }),
    };

    const formatted = this.formatLog(entry);

    // Route to appropriate console method
    switch (level) {
      case 'debug':
        if (this.isDevelopment) console.log(formatted);
        break;
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }
}

export const logger = new Logger();
