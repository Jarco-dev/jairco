import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import type { UserId } from "@/shared/kernel/values/UserId.ts";

interface UserProps {
  id: UserId;
  discordId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): ResultType<User, AppError> {
    if (props.updatedAt < props.createdAt) {
      return errRes(AppError.validation("updatedAt can't be before createdAt"));
    }

    return okRes(new User(props));
  }

  static unsafe(props: UserProps): User {
    return new User(props);
  }

  get id(): UserId {
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
