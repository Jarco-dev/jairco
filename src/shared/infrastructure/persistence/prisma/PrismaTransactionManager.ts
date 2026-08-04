import { inject } from "inversify";
import { DiTypes } from "@/di/container.ts";
import type { IDatabaseTransactionManager } from "@/shared/application/interfaces/IDatabaseTransactionManager.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
import type { PrismaService } from "@/shared/infrastructure/persistence/prisma/PrismaService.ts";
import { PrismaTransactionContext } from "@/shared/infrastructure/persistence/prisma/PrismaTransactionContext.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class PrismaTransactionManager implements IDatabaseTransactionManager {
  constructor(
    @inject(DiTypes.shared.PrismaService) private prismaService: PrismaService,
    @inject(PrismaTransactionContext)
    private prismaTransactionContext: PrismaTransactionContext,
    @inject(DiTypes.shared.Logger) private logger: ILogger,
  ) {}

  async run<T>(callback: () => Promise<T>): Promise<ResultType<T, AppError>> {
    try {
      const value = await this.prismaService.prisma.$transaction(async (tx) => {
        return this.prismaTransactionContext.run(tx, callback);
      });
      return okRes(value);
    } catch (error) {
      if (error instanceof AppError) return errRes(error);
      this.logger.error(
        "Transaction failed",
        error instanceof Error ? error : undefined,
      );
      return errRes(AppError.internal("Transaction failed"));
    }
  }
}
