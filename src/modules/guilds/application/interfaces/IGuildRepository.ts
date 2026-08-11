import type { Guild } from "@/modules/guilds/domain/entities/Guild.ts";
import type { GuildId } from "@/modules/guilds/domain/values/GuildId.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export interface IGuildRepository {
  save(guild: Guild): Promise<ResultType<void, AppError>>;
  findById(id: GuildId): Promise<ResultType<Guild | null, AppError>>;
  findByDiscordId(
    discordId: string,
  ): Promise<ResultType<Guild | null, AppError>>;
  deleteById(id: GuildId): Promise<ResultType<void, AppError>>;
}
