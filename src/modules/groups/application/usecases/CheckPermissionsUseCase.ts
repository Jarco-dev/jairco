import { inject, injectable } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type {
  CheckPermissionsInput,
  CheckPermissionsOutput,
} from "@/modules/groups/application/dtos/CheckPermissionsDto.ts";
import type { IGroupRepository } from "@/modules/groups/application/interfaces/IGroupRepository.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import type { UseCase } from "@/shared/kernel/types/UseCase.ts";
import { AppPermissionBitField } from "@/shared/kernel/values/AppPermissionBitField.ts";

@injectable()
export class CheckPermissionsUseCase
  implements UseCase<CheckPermissionsInput, CheckPermissionsOutput>
{
  constructor(
    @inject(DiTypes.groups.GroupRepository) private groupRepo: IGroupRepository,
  ) {}

  async execute(
    input: CheckPermissionsInput,
  ): Promise<ResultType<CheckPermissionsOutput, AppError>> {
    const groupsRes =
      await this.groupRepo.findAllByDiscordIdInGuildByUserAndRoles(
        input.guildId,
        input.userId,
        input.roleIds,
      );
    if (groupsRes.isErr()) return errRes(groupsRes.error);
    if (groupsRes.value.length === 0) return okRes({ passed: false });

    const userPerms = AppPermissionBitField.unsafe(
      AppPermissionBitField.resolve(
        groupsRes.value.map((group) => group.permissions),
      ),
    );

    return okRes({ passed: userPerms.has(input.requiredPermissions) });
  }
}
