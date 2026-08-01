import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class GroupId {
  private constructor(public readonly value: string) {}

  static create(value: string): ResultType<GroupId, AppError> {
    if (value.length === 0) {
      return errRes(AppError.validation("Invalid group id"));
    }

    return okRes(new GroupId(value));
  }

  static unsafe(value: string): GroupId {
    return new GroupId(value);
  }
}
