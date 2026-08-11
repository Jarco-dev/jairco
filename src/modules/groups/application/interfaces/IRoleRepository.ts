import type { Role } from "@/modules/groups/domain/entities/Role.ts";
import type { RoleId } from "@/modules/groups/domain/values/RoleId.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export interface IRoleRepository {
  save(role: Role): Promise<ResultType<Role, AppError>>;
  findById(id: RoleId): Promise<ResultType<Role | null, AppError>>;
  deleteById(id: RoleId): Promise<ResultType<void, AppError>>;
}
