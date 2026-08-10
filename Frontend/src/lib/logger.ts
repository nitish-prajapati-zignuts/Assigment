/**
 * Frontend Logger
 * Provides structured logging for client-side operations
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
}

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
        },
      }),
    };

    const formatted = this.formatLog(entry);

    // Log to console based on level
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

    // Send errors to backend for monitoring (in production)
    if (level === 'error' && !this.isDevelopment) {
      this.sendErrorToBackend(entry);
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

  /**
   * Send error to backend for monitoring
   */
  private sendErrorToBackend(entry: LogEntry): void {
    // In production, send errors to a monitoring endpoint
    // This could be integrated with Sentry, LogRocket, or your own API
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/errors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        }).catch(() => {
          // Silently fail if error logging fails
        });
      } catch {
        // Ignore
      }
    }
  }
}

export const logger = new ClientLogger();
