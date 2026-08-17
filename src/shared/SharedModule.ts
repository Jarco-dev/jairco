import { ContainerModule } from "inversify";
import type { DatabaseTransactionManager } from "@/shared/application/interfaces/DatabaseTransactionManager.ts";
import type { DateProvider } from "@/shared/application/interfaces/DateProvider.ts";
import type { IdGenerator } from "@/shared/application/interfaces/IdGenerator.ts";
import type { Logger } from "@/shared/application/interfaces/Logger.ts";
import { NodeDateProvider } from "@/shared/infrastructure/date/NodeDateProvider.ts";
import { Cuid2IdGenerator } from "@/shared/infrastructure/ids/Cuid2IdGenerator.ts";
import { ConsoleLogger } from "@/shared/infrastructure/logging/ConsoleLogger.ts";
import { PrismaService } from "@/shared/infrastructure/persistence/prisma/PrismaService.ts";
import { PrismaTransactionContext } from "@/shared/infrastructure/persistence/prisma/PrismaTransactionContext.ts";
import { PrismaTransactionManager } from "@/shared/infrastructure/persistence/prisma/PrismaTransactionManager.ts";
import { SharedDiTypes } from "@/shared/SharedDiTypes.ts";

export const SharedModule = new ContainerModule(({ bind }) => {
  // Persistence
  bind(PrismaService).toSelf();
  bind(PrismaTransactionContext).toSelf();
  bind<DatabaseTransactionManager>(SharedDiTypes.DatabaseTransactionManager).to(
    PrismaTransactionManager,
  );

  // Utils
  bind<DateProvider>(SharedDiTypes.DateProvider).to(NodeDateProvider);
  bind<IdGenerator>(SharedDiTypes.IdGenerator).to(Cuid2IdGenerator);
  bind<Logger>(SharedDiTypes.Logger).to(ConsoleLogger);
});
