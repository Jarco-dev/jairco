export enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

export interface Logger {
  logLevel: LogLevel;
  setLogLevel(level: LogLevel): void;
  verbose: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}
