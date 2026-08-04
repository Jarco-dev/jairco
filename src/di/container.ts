import { Container } from "inversify";
import { GroupDiTypes, GroupModule } from "@/modules/groups/GroupModule.ts";
import { GuildDiTypes, GuildModule } from "@/modules/guilds/GuildModule.ts";
import { UserDiTypes, UserModule } from "@/modules/users/UserModule.ts";
import { SharedDiTypes, SharedModule } from "@/shared/SharedModule.ts";

export const DiTypes = {
  shared: SharedDiTypes,
  users: UserDiTypes,
  guild: GuildDiTypes,
  groups: GroupDiTypes,
} as const;

export const container = new Container({ defaultScope: "Singleton" });

container.load(SharedModule, UserModule, GuildModule, GroupModule);
