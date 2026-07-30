import type { Guild } from "@/modules/guilds/domain/entities/Guild.ts";
import type { GuildId } from "@/modules/guilds/domain/values/GuildId.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export abstract class IGuildRepository {
  abstract save(guild: Guild): Promise<ResultType<void, AppError>>;
  abstract findById(id: GuildId): Promise<ResultType<Guild | null, AppError>>;
  abstract findByDiscordId(
    discordId: string,
  ): Promise<ResultType<Guild | null, AppError>>;
  abstract deleteById(id: GuildId): Promise<ResultType<void, AppError>>;
}
