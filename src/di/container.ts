import { Container } from "inversify";
import { GroupModule } from "@/modules/groups/GroupModule.ts";
import { GuildModule } from "@/modules/guilds/GuildModule.ts";
import { UserModule } from "@/modules/users/UserModule.ts";
import { DiscordModule } from "@/shared/presenter/discord/DiscordModule.ts";
import { SharedModule } from "@/shared/SharedModule.ts";

export const container = new Container({ defaultScope: "Singleton" });

container.load(
  SharedModule,
  UserModule,
  GuildModule,
  GroupModule,
  DiscordModule,
);
