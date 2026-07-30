import { User } from "@/modules/users/domain/entities/User.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";
import { UserId } from "@/shared/kernel/values/UserId.ts";

export class UserMapper {
  static toDomain(user: PrismaTypes.User): User {
    return User.unsafe({
      id: UserId.unsafe(user.id),
      discordId: user.discordId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
