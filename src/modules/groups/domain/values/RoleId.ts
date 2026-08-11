import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class RoleId {
  private constructor(public readonly value: number) {}

  static create(value: number): ResultType<RoleId, AppError> {
    if (Number.isNaN(value) || value < 0) {
      return errRes(AppError.validation("Invalid role id"));
    }

    return okRes(new RoleId(value));
  }

  static unsafe(value: number): RoleId {
    return new RoleId(value);
  }
}
