import type { AppBitFieldResolvable } from "@/shared/kernel/values/AppPermissionBitField.ts";

export interface CheckPermissionsInput {
  guildId: string;
  userId: string;
  roleIds: string[];
  requiredPermissions: AppBitFieldResolvable;
}

export interface CheckPermissionsOutput {
  passed: boolean;
}
