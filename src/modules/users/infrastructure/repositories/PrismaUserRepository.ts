import { inject, injectable } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { IUserRepository } from "@/modules/users/application/interfaces/IUserRepository.ts";
import type { User } from "@/modules/users/domain/entities/User.ts";
import { UserMapper } from "@/modules/users/infrastructure/mappers/UserMapper.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
import type { PrismaService } from "@/shared/infrastructure/persistence/prisma/PrismaService.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import type { UserId } from "@/shared/kernel/values/UserId.ts";

@injectable()
export class PrismaUserRepository implements IUserRepository {
  private repo: PrismaTypes.Prisma.UserDelegate;

  constructor(
    @inject(DiTypes.PrismaService) private db: PrismaService,
    @inject(DiTypes.Logger) private logger: ILogger,
  ) {
    this.repo = this.db.getRepository("user");
  }

  async save(user: User): Promise<ResultType<void, AppError>> {
    const data = {
      id: user.id.value,
      discordId: user.discordId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    try {
      await this.repo.upsert({
        where: { id: user.id.value },
        update: data,
        create: data,
      });
      return okRes(undefined);
    } catch (error) {
      this.logger.error(
        "Failed to save user",
        error instanceof Error ? error : undefined,
        { id: user.id.value },
      );
      return errRes(AppError.internal("Failed to save user"));
    }
  }

  async findById(id: UserId): Promise<ResultType<User | null, AppError>> {
    try {
      const dbUser = await this.repo.findUnique({ where: { id: id.value } });
      return okRes(dbUser ? UserMapper.toDomain(dbUser) : null);
    } catch (error) {
      this.logger.error(
        "Failed to find user by id",
        error instanceof Error ? error : undefined,
        { id: id.value },
      );
      return errRes(AppError.internal("Failed to find user by id"));
    }
  }

  async findByDiscordId(
    discordId: string,
  ): Promise<ResultType<User | null, AppError>> {
    try {
      const dbUser = await this.repo.findUnique({ where: { discordId } });
      return okRes(dbUser ? UserMapper.toDomain(dbUser) : null);
    } catch (error) {
      this.logger.error(
        "Failed to find user by discordId",
        error instanceof Error ? error : undefined,
        { discordId },
      );
      return errRes(AppError.internal("Failed to find user by discordId"));
    }
  }

  async deleteById(id: UserId): Promise<ResultType<void, AppError>> {
    try {
      await this.repo.delete({ where: { id: id.value } });
      return okRes(undefined);
    } catch (error) {
      this.logger.error(
        "Failed to delete user by id",
        error instanceof Error ? error : undefined,
        { id: id.value },
      );
      return errRes(AppError.internal("Failed to delete user by id"));
    }
  }
}
