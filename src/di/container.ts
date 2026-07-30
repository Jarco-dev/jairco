import { Container } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { IDateProvider } from "@/shared/application/interfaces/IDateProvider.ts";
import type { IIdGenerator } from "@/shared/application/interfaces/IIdGenerator.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
import { NodeDateProvider } from "@/shared/infrastructure/date/NodeDateProvider.ts";
import { Cuid2IdGenerator } from "@/shared/infrastructure/ids/Cuid2IdGenerator.ts";
import { ConsoleLogger } from "@/shared/infrastructure/logging/ConsoleLogger.ts";
import { PrismaService } from "@/shared/infrastructure/persistence/prisma/PrismaService.ts";
import { PrismaTransactionContext } from "@/shared/infrastructure/persistence/prisma/PrismaTransactionContext.ts";
import { PrismaTransactionManager } from "@/shared/infrastructure/persistence/prisma/PrismaTransactionManager.ts";

export const container = new Container({ defaultScope: "Singleton" });

container.bind(PrismaTransactionContext).toSelf();
container.bind(DiTypes.PrismaService).to(PrismaService);
container.bind(DiTypes.DatabaseTransactionManager).to(PrismaTransactionManager);
container.bind<IDateProvider>(DiTypes.DateProvider).to(NodeDateProvider);
container.bind<IIdGenerator>(DiTypes.IdGenerator).to(Cuid2IdGenerator);
container.bind<ILogger>(DiTypes.Logger).to(ConsoleLogger);
