import type { User } from "@/modules/users/domain/entities/User.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import type { UserId } from "@/shared/kernel/values/UserId.ts";

export abstract class IUserRepository {
  abstract save(user: User): Promise<ResultType<void, AppError>>;
  abstract findById(id: UserId): Promise<ResultType<User | null, AppError>>;
  abstract findByDiscordId(
    discordId: string,
  ): Promise<ResultType<User | null, AppError>>;
  abstract deleteById(id: UserId): Promise<ResultType<void, AppError>>;
}
