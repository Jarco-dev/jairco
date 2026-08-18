import { User } from "@/modules/users/domain/entities/User.ts";
import { UserId } from "@/modules/users/domain/values/UserId.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";

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
