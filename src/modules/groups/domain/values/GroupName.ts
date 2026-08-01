import { GROUP_NAME_RULES } from "@/modules/groups/domain/rules/GroupNameRules.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class GroupName {
  constructor(public readonly value: string) {}

  static create(value: string): ResultType<GroupName, AppError> {
    const normalized = value.trim();

    if (
      normalized.length < GROUP_NAME_RULES.MIN_LENGTH ||
      normalized.length > GROUP_NAME_RULES.MAX_LENGTH
    ) {
      return errRes(
        AppError.validation(
          "Group name must be between 3 and 20 characters long",
        ),
      );
    }
    if (!GROUP_NAME_RULES.ALLOWED_CHAR_REGEX.test(normalized)) {
      return errRes(
        AppError.validation(
          "Group names can only contain letters, numbers, and underscores",
        ),
      );
    }

    return okRes(new GroupName(normalized));
  }

  static unsafe(value: string): GroupName {
    return new GroupName(value);
  }
}
