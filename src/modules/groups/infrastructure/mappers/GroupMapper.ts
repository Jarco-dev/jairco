import { Group } from "@/modules/groups/domain/entities/Group.ts";
import { GroupId } from "@/modules/groups/domain/values/GroupId.ts";
import { GroupName } from "@/modules/groups/domain/values/GroupName.ts";
import { RoleId } from "@/modules/groups/domain/values/RoleId.ts";
import { GuildId } from "@/modules/guilds/domain/values/GuildId.ts";
import { UserId } from "@/modules/users/domain/values/UserId.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";
import { AppPermissionBitField } from "@/shared/kernel/values/AppPermissionBitField.ts";

export class GroupMapper {
  static toDomain(
    group: PrismaTypes.Group & {
      Roles: { id: PrismaTypes.Role["id"] }[];
      Users: { id: PrismaTypes.User["id"] }[];
    },
  ): Group {
    return Group.unsafe({
      id: GroupId.unsafe(group.id),
      name: GroupName.unsafe(group.name),
      permissions: AppPermissionBitField.unsafe(group.permissions),
      guildId: GuildId.unsafe(group.guildId),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      roleIds: group.Roles.map((role) => RoleId.unsafe(role.id)),
      userIds: group.Users.map((user) => UserId.unsafe(user.id)),
    });
  }
}
