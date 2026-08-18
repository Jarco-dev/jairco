import { inject, injectable } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { GroupRepository } from "@/modules/groups/application/interfaces/GroupRepository.ts";
import type { Group } from "@/modules/groups/domain/entities/Group.ts";
import type { GroupId } from "@/modules/groups/domain/values/GroupId.ts";
import { GroupMapper } from "@/modules/groups/infrastructure/mappers/GroupMapper.ts";
import type { Logger } from "@/shared/application/interfaces/Logger.ts";
import { PrismaService } from "@/shared/infrastructure/persistence/prisma/PrismaService.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

@injectable()
export class PrismaGroupRepository implements GroupRepository {
  private repo: PrismaTypes.Prisma.GroupDelegate;

  constructor(
    @inject(PrismaService) private db: PrismaService,
    @inject(DiTypes.shared.Logger) private logger: Logger,
  ) {
    this.repo = this.db.getRepository("group");
  }

  async save(group: Group): Promise<ResultType<Group, AppError>> {
    const data = {
      id: group.id?.value,
      guildId: group.guildId.value,
      name: group.name.value,
      permissions: group.permissions.value,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };

    const roleIds = group.roleIds.map((roleId) => ({ id: roleId.value }));
    const userIds = group.userIds.map((userId) => ({ id: userId.value }));

    try {
      const dbGroup = await this.repo.upsert({
        where: { id: data.id },
        update: {
          ...data,
          Roles: { set: roleIds },
          Users: { set: userIds },
        },
        create: {
          ...data,
          Roles: { connect: roleIds },
          Users: { connect: userIds },
        },
        include: {
          Roles: { select: { id: true } },
          Users: { select: { id: true } },
        },
      });
      return okRes(GroupMapper.toDomain(dbGroup));
    } catch (error) {
      this.logger.error("Failed to save group", {
        error,
        data,
        roleIds,
        userIds,
      });
      return errRes(AppError.internal("Failed to save group"));
    }
  }

  async findById(id: GroupId): Promise<ResultType<Group | null, AppError>> {
    try {
      const dbGroup = await this.repo.findUnique({
        where: { id: id.value },
        include: {
          Roles: { select: { id: true } },
          Users: { select: { id: true } },
        },
      });

      return okRes(dbGroup ? GroupMapper.toDomain(dbGroup) : null);
    } catch (error) {
      this.logger.error("Failed to find group by id", { error, id: id.value });
      return errRes(AppError.internal("Failed to find group by id"));
    }
  }

  async findAllByDiscordIdInGuildByUserAndRoles(
    guildId: string,
    userDiscordId: string,
    roleDiscordIds: string[],
  ): Promise<ResultType<Group[], AppError>> {
    try {
      const dbGroups = await this.repo.findMany({
        where: {
          Guild: { discordId: guildId },
          OR: [
            { Users: { some: { discordId: userDiscordId } } },
            { Roles: { some: { discordId: { in: roleDiscordIds } } } },
          ],
        },
        include: {
          Roles: { select: { id: true } },
          Users: { select: { id: true } },
        },
      });

      return okRes(dbGroups.map((group) => GroupMapper.toDomain(group)));
    } catch (error) {
      this.logger.error("Failed to find groups by user and roles", {
        error,
        guildId,
        userDiscordId,
        roleDiscordIds,
      });
      return errRes(
        AppError.internal("Failed to find groups by user and roles"),
      );
    }
  }

  async deleteById(id: GroupId): Promise<ResultType<void, AppError>> {
    try {
      await this.repo.delete({ where: { id: id.value } });
      return okRes(undefined);
    } catch (error) {
      this.logger.error("Failed to delete group by id", {
        error,
        id: id.value,
      });
      return errRes(AppError.internal("Failed to delete group by id"));
    }
  }
}
