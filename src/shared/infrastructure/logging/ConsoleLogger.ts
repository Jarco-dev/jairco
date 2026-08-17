import { inject, injectable } from "inversify";
import {
  type Logger,
  LogLevel,
} from "@/shared/application/interfaces/Logger.ts";
import type { env } from "@/shared/infrastructure/config/env.ts";
import { SharedDiTypes } from "@/shared/SharedDiTypes.ts";

@injectable()
export class ConsoleLogger implements Logger {
  logLevel: LogLevel = LogLevel.INFO;
  private readonly levelConfigs: {
    [key in LogLevel]: { name: string; color: string };
  } = {
    [LogLevel.VERBOSE]: { name: "VERBOSE", color: "\x1b[37m" },
    [LogLevel.DEBUG]: { name: "DEBUG", color: "\x1b[36m" },
    [LogLevel.INFO]: { name: "INFO", color: "\x1b[32m" },
    [LogLevel.WARN]: { name: "WARN", color: "\x1b[33m" },
    [LogLevel.ERROR]: { name: "ERROR", color: "\x1b[31m" },
  };

  constructor(@inject(SharedDiTypes.envConfig) private config: typeof env) {
    this.setLogLevel(LogLevel[this.config.LOG_LEVEL]);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  verbose(message: string, meta?: Record<string, unknown>): void {
    this.processLog(LogLevel.VERBOSE, message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.processLog(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.processLog(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.processLog(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.processLog(LogLevel.ERROR, message, meta);
  }

  private getDateString(): string {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  private processLog(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    if (level < this.logLevel) return;
    console.log(
      `${this.levelConfigs[level].color}%s %s\x1b[0m`,
      `[${this.getDateString()}]`,
      `[${this.levelConfigs[level].name}]`,
      ...(meta ? [message, meta] : [message]),
    );
  }
}
