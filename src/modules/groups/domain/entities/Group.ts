import type { GroupId } from "@/modules/groups/domain/values/GroupId.ts";
import type { GroupName } from "@/modules/groups/domain/values/GroupName.ts";
import type { RoleId } from "@/modules/groups/domain/values/RoleId.ts";
import type { GuildId } from "@/modules/guilds/domain/values/GuildId.ts";
import type { UserId } from "@/modules/users/domain/values/UserId.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import type { AppPermissionBitField } from "@/shared/kernel/values/AppPermissionBitField.ts";

interface GroupProps {
  id: GroupId;
  guildId: GuildId;
  name: GroupName;
  permissions: AppPermissionBitField;
  createdAt: Date;
  updatedAt: Date;

  roleIds: RoleId[];
  userIds: UserId[];
}

export class Group {
  private constructor(private readonly props: GroupProps) {}

  static create(props: GroupProps): ResultType<Group, AppError> {
    if (props.updatedAt < props.createdAt) {
      return errRes(AppError.validation("updatedAt can't be before createdAt"));
    }

    return okRes(new Group(props));
  }

  static unsafe(props: GroupProps): Group {
    return new Group(props);
  }

  get id(): GroupId {
    return this.props.id;
  }

  get guildId(): GuildId {
    return this.props.guildId;
  }

  get name(): GroupName {
    return this.props.name;
  }

  get permissions(): AppPermissionBitField {
    return this.props.permissions;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get roleIds(): RoleId[] {
    return this.props.roleIds;
  }

  addRoles(roleIds: RoleId[]): ResultType<undefined, AppError> {
    const rawIds = this.props.roleIds.map((roleId) => roleId.value);
    const existing = roleIds.filter((roleId) => rawIds.includes(roleId.value));

    if (existing.length > 0) {
      return errRes(
        AppError.conflict("Some roles already exists in group", { existing }),
      );
    }

    this.props.roleIds.push(...roleIds);
    return okRes(undefined);
  }

  removeRoles(roleIds: RoleId[]): ResultType<undefined, AppError> {
    const rawIds = this.props.roleIds.map((roleId) => roleId.value);
    const notExisting = roleIds.filter(
      (roleId) => !rawIds.includes(roleId.value),
    );

    if (notExisting.length > 0) {
      return errRes(
        AppError.conflict("Some roles don't exists in group", { notExisting }),
      );
    }

    const toRemove = roleIds.map((roleId) => roleId.value);
    this.props.roleIds = this.props.roleIds.filter(
      (roleId) => !toRemove.includes(roleId.value),
    );
    return okRes(undefined);
  }

  get userIds(): UserId[] {
    return this.props.userIds;
  }

  addUsers(userIds: UserId[]): ResultType<undefined, AppError> {
    const rawIds = this.props.userIds.map((userId) => userId.value);
    const existing = userIds.filter((userId) => rawIds.includes(userId.value));

    if (existing.length > 0) {
      return errRes(
        AppError.conflict("Some users already exists in group", { existing }),
      );
    }

    this.props.userIds.push(...userIds);
    return okRes(undefined);
  }

  removeUsers(userIds: UserId[]): ResultType<undefined, AppError> {
    const rawIds = this.props.userIds.map((userId) => userId.value);
    const notExisting = userIds.filter(
      (userId) => !rawIds.includes(userId.value),
    );

    if (notExisting.length > 0) {
      return errRes(
        AppError.conflict("Some users don't exists in group", { notExisting }),
      );
    }

    const toRemove = userIds.map((userId) => userId.value);
    this.props.userIds = this.props.userIds.filter(
      (userId) => !toRemove.includes(userId.value),
    );
    return okRes(undefined);
  }
}
