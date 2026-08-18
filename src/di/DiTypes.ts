import { GroupDiTypes } from "@/modules/groups/GroupDiTypes.ts";
import { GuildDiTypes } from "@/modules/guilds/GuildDiTypes.ts";
import { UserDiTypes } from "@/modules/users/UserDiTypes.ts";
import { DiscordDiTypes } from "@/shared/presenter/discord/DiscordDiTypes.ts";
import { SharedDiTypes } from "@/shared/SharedDiTypes.ts";

export const DiTypes = {
  shared: SharedDiTypes,
  users: UserDiTypes,
  guild: GuildDiTypes,
  groups: GroupDiTypes,
  discord: DiscordDiTypes,
} as const;
