import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class GroupId {
  private constructor(public readonly value: number) {}

  static create(value: number): ResultType<GroupId, AppError> {
    if (Number.isNaN(value) || value < 0) {
      return errRes(AppError.validation("Invalid group id"));
    }

    return okRes(new GroupId(value));
  }

  static unsafe(value: number): GroupId {
    return new GroupId(value);
  }
}
