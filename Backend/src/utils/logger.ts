/**
 * Structured Logging Utility
 * Provides consistent, production-ready logging across the application
 * with different severity levels (debug, info, warn, error)
 */

import util from "util";

export type LogLevel = "debug" | "info" | "warn" | "error";

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
  private isDevelopment = process.env.NODE_ENV !== "production";

  private formatLog(entry: LogEntry): string {
    const timestamp = new Date().toISOString();

    if (this.isDevelopment) {
      const reset = "\x1b[0m";
      const gray = "\x1b[90m";
      const bold = "\x1b[1m";
      
      let levelColor = "";
      switch (entry.level) {
        case "debug":
          levelColor = "\x1b[36m"; // Cyan
          break;
        case "info":
          levelColor = "\x1b[32m"; // Green
          break;
        case "warn":
          levelColor = "\x1b[33m"; // Yellow
          break;
        case "error":
          levelColor = "\x1b[31m"; // Red
          break;
      }

      const levelStr = `${levelColor}${bold}[${entry.level.toUpperCase()}]${reset}`;
      const tsStr = `${gray}[${timestamp}]${reset}`;
      let logLine = `${tsStr} ${levelStr} ${entry.message}`;

      if (entry.context && Object.keys(entry.context).length > 0) {
        const contextStr = util.inspect(entry.context, {
          colors: true,
          depth: 3,
          breakLength: 100,
          compact: true,
        });
        logLine += ` ${gray}context:${reset} ${contextStr}`;
      }

      if (entry.error) {
        const errorStr = util.inspect(entry.error, {
          colors: true,
          depth: 5,
          breakLength: 80,
          compact: false,
        });
        logLine += `\n${levelColor}${bold}[ERROR DETAILS]${reset}\n${errorStr}`;
      }

      return logLine;
    }

    const formatted = {
      ...entry,
      timestamp,
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
      case "debug":
        if (this.isDevelopment) console.log(formatted);
        break;
      case "info":
        console.log(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log("error", message, context, error);
  }
}

export const logger = new Logger();
