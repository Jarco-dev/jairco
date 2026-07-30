import { injectable } from "inversify";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";

@injectable()
export class ConsoleLogger implements ILogger {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    console.error(message, error, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(message, meta);
  }
}
