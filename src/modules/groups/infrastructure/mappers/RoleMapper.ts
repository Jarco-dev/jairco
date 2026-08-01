import { Role } from "@/modules/groups/domain/entities/Role.ts";
import { RoleId } from "@/modules/groups/domain/values/RoleId.ts";
import { GuildId } from "@/modules/guilds/domain/values/GuildId.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";

export class RoleMapper {
  static toDomain(role: PrismaTypes.Role): Role {
    return Role.unsafe({
      id: RoleId.unsafe(role.id),
      guildId: GuildId.unsafe(role.guildId),
      discordId: role.discordId,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }
}
