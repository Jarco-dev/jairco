import { inject } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { DatabaseTransactionManager } from "@/shared/application/interfaces/DatabaseTransactionManager.ts";
import type { Logger } from "@/shared/application/interfaces/Logger.ts";
import { PrismaService } from "@/shared/infrastructure/persistence/prisma/PrismaService.ts";
import { PrismaTransactionContext } from "@/shared/infrastructure/persistence/prisma/PrismaTransactionContext.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class PrismaTransactionManager implements DatabaseTransactionManager {
  constructor(
    @inject(PrismaService) private prismaService: PrismaService,
    @inject(PrismaTransactionContext)
    private prismaTransactionContext: PrismaTransactionContext,
    @inject(DiTypes.shared.Logger) private logger: Logger,
  ) {}

  async run<T>(callback: () => Promise<T>): Promise<ResultType<T, AppError>> {
    try {
      const value = await this.prismaService.client.$transaction(async (tx) => {
        return this.prismaTransactionContext.run(tx, callback);
      });
      return okRes(value);
    } catch (error) {
      if (error instanceof AppError) return errRes(error);
      this.logger.error("Transaction failed", { error });
      return errRes(AppError.internal("Transaction failed"));
    }
  }
}
