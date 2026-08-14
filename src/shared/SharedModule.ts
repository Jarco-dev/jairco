import { ContainerModule } from "inversify";
import type { IDatabaseTransactionManager } from "@/shared/application/interfaces/IDatabaseTransactionManager.ts";
import type { IDateProvider } from "@/shared/application/interfaces/IDateProvider.ts";
import type { IIdGenerator } from "@/shared/application/interfaces/IIdGenerator.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
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
  bind<IDatabaseTransactionManager>(
    SharedDiTypes.DatabaseTransactionManager,
  ).to(PrismaTransactionManager);

  // Utils
  bind<IDateProvider>(SharedDiTypes.DateProvider).to(NodeDateProvider);
  bind<IIdGenerator>(SharedDiTypes.IdGenerator).to(Cuid2IdGenerator);
  bind<ILogger>(SharedDiTypes.Logger).to(ConsoleLogger);
});
