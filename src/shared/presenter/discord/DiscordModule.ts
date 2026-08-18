import { ContainerModule } from "inversify";
import { CommandRegistry } from "@/shared/presenter/discord/bootstrap/CommandRegistry.ts";
import { createDiscordClient } from "@/shared/presenter/discord/bootstrap/createDiscordClient.ts";
import { EventDispatcher } from "@/shared/presenter/discord/bootstrap/EventDispatcher.ts";
import { PingCommand } from "@/shared/presenter/discord/commands/PingCommand.ts";
import { DiscordDiTypes } from "@/shared/presenter/discord/DiscordDiTypes.ts";
import { BotReadyEvent } from "@/shared/presenter/discord/events/BotReadyEvent.ts";
import { InteractionRouterEvent } from "@/shared/presenter/discord/events/InteractionRouterEvent.ts";
import { PermissionChecker } from "@/shared/presenter/discord/services/PermissionChecker.ts";

export const DiscordModule = new ContainerModule(({ bind }) => {
  // Services
  bind(DiscordDiTypes.Client).toConstantValue(createDiscordClient());
  bind(PermissionChecker).toSelf();
  bind(CommandRegistry).toSelf().inSingletonScope();
  bind(EventDispatcher).toSelf();

  // Events
  bind(DiscordDiTypes.Event).to(BotReadyEvent);
  bind(DiscordDiTypes.Event).to(InteractionRouterEvent);

  // Commands
  bind(DiscordDiTypes.Command).to(PingCommand);
});
