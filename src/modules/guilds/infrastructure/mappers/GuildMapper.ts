import { Guild } from "@/modules/guilds/domain/entities/Guild.ts";
import { GuildId } from "@/modules/guilds/domain/values/GuildId.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";

export class GuildMapper {
  static toDomain(guild: PrismaTypes.Guild): Guild {
    return Guild.unsafe({
      id: GuildId.unsafe(guild.id),
      discordId: guild.discordId,
      createdAt: guild.createdAt,
      updatedAt: guild.updatedAt,
    });
  }
}
