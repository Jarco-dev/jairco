import type { User } from "@/modules/users/domain/entities/User.ts";
import type { UserId } from "@/modules/users/domain/values/UserId.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export interface IUserRepository {
  save(user: User): Promise<ResultType<User, AppError>>;
  findById(id: UserId): Promise<ResultType<User | null, AppError>>;
  findByDiscordId(
    discordId: string,
  ): Promise<ResultType<User | null, AppError>>;
  deleteById(id: UserId): Promise<ResultType<void, AppError>>;
}
