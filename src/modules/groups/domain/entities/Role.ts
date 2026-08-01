import type { RoleId } from "@/modules/groups/domain/values/RoleId.ts";
import type { GuildId } from "@/modules/guilds/domain/values/GuildId.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

interface RoleProps {
  id: RoleId;
  guildId: GuildId;
  discordId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Role {
  private constructor(private readonly props: RoleProps) {}

  static create(props: RoleProps): ResultType<Role, AppError> {
    if (props.updatedAt < props.createdAt) {
      return errRes(AppError.validation("updatedAt can't be before createdAt"));
    }

    if (props.discordId.length === 0) {
      return errRes(AppError.validation("Invalid role discordId"));
    }

    return okRes(new Role(props));
  }

  static unsafe(props: RoleProps): Role {
    return new Role(props);
  }

  get id(): RoleId {
    return this.props.id;
  }

  get discordId(): string {
    return this.props.discordId;
  }

  get guildId(): GuildId {
    return this.props.guildId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
