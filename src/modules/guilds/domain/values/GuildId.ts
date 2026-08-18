import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class GuildId {
  private constructor(public readonly value: number) {}

  static create(value: number): ResultType<GuildId, AppError> {
    if (Number.isNaN(value) || value < 0) {
      return errRes(AppError.validation("Invalid guild id"));
    }

    return okRes(new GuildId(value));
  }

  static unsafe(value: number): GuildId {
    return new GuildId(value);
  }
}
