import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class UserId {
  private constructor(public readonly value: string) {}

  static create(value: string): ResultType<UserId, AppError> {
    if (value.length === 0) {
      return errRes(AppError.validation("Invalid user id"));
    }

    return okRes(new UserId(value));
  }

  static unsafe(value: string): UserId {
    return new UserId(value);
  }
}
