import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class RoleId {
  private constructor(public readonly value: string) {}

  static create(value: string): ResultType<RoleId, AppError> {
    if (value.length === 0) {
      return errRes(AppError.validation("Invalid role id"));
    }

    return okRes(new RoleId(value));
  }

  static unsafe(value: string): RoleId {
    return new RoleId(value);
  }
}
