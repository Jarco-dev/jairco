import { ContainerModule } from "inversify";
import type { IDateProvider } from "@/shared/application/interfaces/IDateProvider.ts";
import type { IIdGenerator } from "@/shared/application/interfaces/IIdGenerator.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
import { NodeDateProvider } from "@/shared/infrastructure/date/NodeDateProvider.ts";
import { Cuid2IdGenerator } from "@/shared/infrastructure/ids/Cuid2IdGenerator.ts";
import { ConsoleLogger } from "@/shared/infrastructure/logging/ConsoleLogger.ts";
import { PrismaTransactionContext } from "@/shared/infrastructure/persistence/prisma/PrismaTransactionContext.ts";

export const SharedDiTypes = {
  Logger: Symbol.for("Logger"),
  PrismaService: Symbol.for("PrismaService"),
  DatabaseTransactionManager: Symbol.for("DatabaseTransactionManager"),
  IdGenerator: Symbol.for("IdGenerator"),
  DateProvider: Symbol.for("DateProvider"),
} as const;

export const SharedModule = new ContainerModule(({ bind }) => {
  // Persistence
  bind(SharedDiTypes.PrismaService).toSelf();
  bind(SharedDiTypes.DatabaseTransactionManager).toSelf();
  bind(PrismaTransactionContext).toSelf();

  // Utils
  bind<IDateProvider>(SharedDiTypes.DateProvider).to(NodeDateProvider);
  bind<IIdGenerator>(SharedDiTypes.IdGenerator).to(Cuid2IdGenerator);
  bind<ILogger>(SharedDiTypes.Logger).to(ConsoleLogger);
});
