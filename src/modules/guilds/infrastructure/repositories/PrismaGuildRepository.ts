import { inject, injectable } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { IGuildRepository } from "@/modules/guilds/application/interfaces/IGuildRepository.ts";
import type { Guild } from "@/modules/guilds/domain/entities/Guild.ts";
import type { GuildId } from "@/modules/guilds/domain/values/GuildId.ts";
import { GuildMapper } from "@/modules/guilds/infrastructure/mappers/GuildMapper.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
import { PrismaService } from "@/shared/infrastructure/persistence/prisma/PrismaService.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

@injectable()
export class PrismaGuildRepository implements IGuildRepository {
  private repo: PrismaTypes.Prisma.GuildDelegate;

  constructor(
    @inject(PrismaService) private db: PrismaService,
    @inject(DiTypes.shared.Logger) private logger: ILogger,
  ) {
    this.repo = this.db.getRepository("guild");
  }

  async save(guild: Guild): Promise<ResultType<Guild, AppError>> {
    const data = {
      id: guild.id?.value,
      discordId: guild.discordId,
      createdAt: guild.createdAt,
      updatedAt: guild.updatedAt,
    };

    try {
      const dbGuild = await this.repo.upsert({
        where: { id: data.id },
        update: data,
        create: data,
      });
      return okRes(GuildMapper.toDomain(dbGuild));
    } catch (error) {
      this.logger.error("Failed to save guild", { error, data });
      return errRes(AppError.internal("Failed to save guild"));
    }
  }

  async findById(id: GuildId): Promise<ResultType<Guild | null, AppError>> {
    try {
      const dbGuild = await this.repo.findUnique({ where: { id: id.value } });
      return okRes(dbGuild ? GuildMapper.toDomain(dbGuild) : null);
    } catch (error) {
      this.logger.error("Failed to find guild by id", { error, id: id.value });
      return errRes(AppError.internal("Failed to find guild by id"));
    }
  }

  async findByDiscordId(
    discordId: string,
  ): Promise<ResultType<Guild | null, AppError>> {
    try {
      const dbGuild = await this.repo.findUnique({ where: { discordId } });
      return okRes(dbGuild ? GuildMapper.toDomain(dbGuild) : null);
    } catch (error) {
      this.logger.error("Failed to find guild by discordId", {
        error,
        discordId,
      });
      return errRes(AppError.internal("Failed to find guild by discordId"));
    }
  }

  async deleteById(id: GuildId): Promise<ResultType<void, AppError>> {
    try {
      await this.repo.delete({ where: { id: id.value } });
      return okRes(undefined);
    } catch (error) {
      this.logger.error("Failed to delete guild by id", {
        error,
        id: id.value,
      });
      return errRes(AppError.internal("Failed to delete guild by id"));
    }
  }
}
