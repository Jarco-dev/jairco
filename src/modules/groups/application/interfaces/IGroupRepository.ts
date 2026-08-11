import type { Group } from "@/modules/groups/domain/entities/Group.ts";
import type { GroupId } from "@/modules/groups/domain/values/GroupId.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export interface IGroupRepository {
  save(group: Group): Promise<ResultType<Group, AppError>>;
  findById(id: GroupId): Promise<ResultType<Group | null, AppError>>;
  deleteById(id: GroupId): Promise<ResultType<void, AppError>>;
}
