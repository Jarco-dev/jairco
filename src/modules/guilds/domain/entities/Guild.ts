import type { GuildId } from "@/modules/guilds/domain/values/GuildId.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

interface GuildProps {
  id: GuildId;
  discordId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Guild {
  private constructor(private readonly props: GuildProps) {}

  static create(props: GuildProps): ResultType<Guild, AppError> {
    if (props.updatedAt < props.createdAt) {
      return errRes(AppError.validation("updatedAt can't be before createdAt"));
    }

    if (props.discordId.length === 0) {
      return errRes(AppError.validation("Invalid guild discordId"));
    }

    return okRes(new Guild(props));
  }

  static unsafe(props: GuildProps): Guild {
    return new Guild(props);
  }

  get id(): GuildId {
    return this.props.id;
  }

  get discordId(): string {
    return this.id.value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
