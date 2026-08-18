import { type Interaction, PermissionsBitField } from "discord.js";
import { inject, injectable } from "inversify";
import { CheckPermissionsUseCase } from "@/modules/groups/application/usecases/CheckPermissionsUseCase.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import {
  type AppBitFieldResolvable,
  AppPermissionBitField,
} from "@/shared/kernel/values/AppPermissionBitField.ts";

@injectable()
export class PermissionChecker {
  constructor(
    @inject(CheckPermissionsUseCase)
    private checkPermissionsUseCase: CheckPermissionsUseCase,
  ) {}

  async check(
    i: Interaction,
    required: AppBitFieldResolvable,
  ): Promise<ResultType<boolean, AppError>> {
    if (!i.guild) return okRes(false);
    if (required === AppPermissionBitField.DefaultBit) return okRes(true);

    const member = await i.guild.members.fetch(i.user.id);
    const hasPerms = await this.checkPermissionsUseCase.execute({
      guildId: i.guild.id,
      userId: i.user.id,
      roleIds: member.roles.cache.map((role) => role.id),
      requiredPermissions: required,
    });
    if (hasPerms.isErr()) return errRes(hasPerms.error);

    if (
      !hasPerms.value.passed &&
      !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
      i.user.id !== i.guild.ownerId
    ) {
      return okRes(false);
    }

    return okRes(true);
  }
}
