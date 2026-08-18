import { AsyncLocalStorage } from "node:async_hooks";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";

export type PrismaTransactionClient = PrismaTypes.Prisma.TransactionClient;

export class PrismaTransactionContext {
  private readonly storage = new AsyncLocalStorage<PrismaTransactionClient>();

  run<T>(tx: PrismaTransactionClient, callback: () => Promise<T>): Promise<T> {
    return this.storage.run(tx, callback);
  }

  getCurrentTransaction(): PrismaTransactionClient | undefined {
    return this.storage.getStore();
  }
}
