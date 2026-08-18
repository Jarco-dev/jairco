import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class UserId {
  private constructor(public readonly value: number) {}

  static create(value: number): ResultType<UserId, AppError> {
    if (Number.isNaN(value) || value < 0) {
      return errRes(AppError.validation("Invalid user id"));
    }

    return okRes(new UserId(value));
  }

  static unsafe(value: number): UserId {
    return new UserId(value);
  }
}
