import type { Group } from "@/modules/groups/domain/entities/Group.ts";
import type { GroupId } from "@/modules/groups/domain/values/GroupId.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export abstract class IGroupRepository {
  abstract save(group: Group): Promise<ResultType<void, AppError>>;
  abstract findById(id: GroupId): Promise<ResultType<Group | null, AppError>>;
  abstract deleteById(id: GroupId): Promise<ResultType<void, AppError>>;
}
