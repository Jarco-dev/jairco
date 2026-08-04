import { inject, injectable } from "inversify";
import { DiTypes } from "@/di/container.ts";
import type { IRoleRepository } from "@/modules/groups/application/interfaces/IRoleRepository.ts";
import type { Role } from "@/modules/groups/domain/entities/Role.ts";
import type { RoleId } from "@/modules/groups/domain/values/RoleId.ts";
import { RoleMapper } from "@/modules/groups/infrastructure/mappers/RoleMapper.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
import type { PrismaService } from "@/shared/infrastructure/persistence/prisma/PrismaService.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

@injectable()
export class PrismaRoleRepository implements IRoleRepository {
  private repo: PrismaTypes.Prisma.RoleDelegate;

  constructor(
    @inject(DiTypes.shared.PrismaService) private db: PrismaService,
    @inject(DiTypes.shared.Logger) private logger: ILogger,
  ) {
    this.repo = this.db.getRepository("role");
  }

  async save(role: Role): Promise<ResultType<void, AppError>> {
    const data = {
      id: role.id.value,
      guildId: role.guildId.value,
      discordId: role.discordId,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };

    try {
      await this.repo.upsert({
        where: { id: role.id.value },
        update: data,
        create: data,
      });
      return okRes(undefined);
    } catch (error) {
      this.logger.error(
        "Failed to save role",
        error instanceof Error ? error : undefined,
        { id: role.id.value },
      );
      return errRes(AppError.internal("Failed to save role"));
    }
  }

  async findById(id: RoleId): Promise<ResultType<Role | null, AppError>> {
    try {
      const dbRole = await this.repo.findUnique({ where: { id: id.value } });
      return okRes(dbRole ? RoleMapper.toDomain(dbRole) : null);
    } catch (error) {
      this.logger.error(
        "Failed to find role by id",
        error instanceof Error ? error : undefined,
        { id: id.value },
      );
      return errRes(AppError.internal("Failed to find role by id"));
    }
  }

  async deleteById(id: RoleId): Promise<ResultType<void, AppError>> {
    try {
      await this.repo.delete({ where: { id: id.value } });
      return okRes(undefined);
    } catch (error) {
      this.logger.error(
        "Failed to delete role by id",
        error instanceof Error ? error : undefined,
        { id: id.value },
      );
      return errRes(AppError.internal("Failed to delete role by id"));
    }
  }
}
