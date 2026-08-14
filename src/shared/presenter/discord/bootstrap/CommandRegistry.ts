import type {
  ApplicationCommandDataResolvable,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import { inject, injectable, multiInject } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import { commandsConfig } from "@/shared/presenter/discord/bootstrap/commandsConfig.ts";
import type { ICommandHandler } from "@/shared/presenter/discord/interfaces/ICommandHandler.ts";
import type { SubCommand } from "@/shared/presenter/discord/interfaces/ICommandsConfig.ts";
import { AppErrorMessage } from "@/shared/presenter/discord/messages/AppErrorMessage.ts";
import { PermissionChecker } from "@/shared/presenter/discord/services/PermissionChecker.ts";

@injectable()
export class CommandRegistry {
  private readonly instanceByCons: Map<SubCommand, ICommandHandler>;
  private readonly byPath: Map<string, ICommandHandler>;

  constructor(
    @inject(DiTypes.shared.Logger) private logger: ILogger,
    @inject(PermissionChecker) private permissions: PermissionChecker,
    @multiInject(DiTypes.discord.Command) commands: ICommandHandler[],
  ) {
    this.instanceByCons = new Map(
      commands.map((command) => [command.constructor as SubCommand, command]),
    );
    this.byPath = this.buildRouteMap();

    this.logger.info(
      `[CommandRegistry] Registered ${this.byPath.size} commands using ${commands.length} handlers`,
    );
  }

  async dispatchInteractionEvent(
    i: ChatInputCommandInteraction | AutocompleteInteraction,
  ): Promise<ResultType<void, AppError>> {
    const group = i.options.getSubcommandGroup(false);
    const sub = i.options.getSubcommand(false);
    const path = [i.commandName, group, sub].filter(Boolean).join(" ");

    const command = this.byPath.get(path);
    if (!command) {
      return errRes(
        AppError.notFound(
          "[CommandRegistry] Command not found in interaction dispatcher",
          { path },
        ),
      );
    }

    if (i.inGuild()) {
      const hasPerms = await this.permissions.check(
        i,
        command.getPermissions(),
      );

      if (hasPerms.isErr()) {
        if (i.isChatInputCommand()) {
          i.reply(new AppErrorMessage(hasPerms.error).build());
        }
        return errRes(hasPerms.error);
      }

      if (!hasPerms.value) {
        const error = AppError.unauthorized(
          "You don't have the permissions required to do this",
        );
        if (i.isChatInputCommand()) {
          i.reply(new AppErrorMessage(error).build());
        }
        return errRes(error);
      }
    }

    this.logger.verbose(
      `[CommandRegistry] Running "/${path}" command using "${command.getBuilder().name}" handler`,
    );
    if (i.isChatInputCommand()) {
      return command.handle(i);
    }
    return command.handleAutoComplete(i);
  }

  private resolve(subCommand: SubCommand): ICommandHandler {
    const instance = this.instanceByCons.get(subCommand);
    if (!instance) {
      throw new Error(
        `[CommandRegistry] No handler bound for ${subCommand.name}. Bind it to DiscordDiTypes.Command`,
      );
    }
    return instance;
  }

  private buildRouteMap(): Map<string, ICommandHandler> {
    const map = new Map<string, ICommandHandler>();

    const register = (prefix: string[], subCommand: SubCommand): void => {
      const instance = this.resolve(subCommand);
      if (!instance.getEnabled()) return;

      const path = [...prefix, instance.getBuilder().name].join(" ");
      map.set(path, instance);
      this.logger.verbose(`[CommandRegistry] Registered command: /${path}`);
    };

    for (const command of commandsConfig) {
      if ("subcommands" in command) {
        for (const subCommand of command.subcommands) {
          register([command.builder.name], subCommand);
        }
      }

      if ("groups" in command) {
        for (const group of command.groups) {
          for (const subCommand of group.subcommands) {
            register([command.builder.name, group.builder.name], subCommand);
          }
        }
      }
    }

    return map;
  }

  getDeployPayload(): ApplicationCommandDataResolvable[] {
    const payload: ApplicationCommandDataResolvable[] = [];

    for (const command of commandsConfig) {
      const builder = command.builder;

      if ("subcommands" in command) {
        command.subcommands
          .map((subCommand) => {
            const instance = this.resolve(subCommand);
            if (!instance.getEnabled()) return null;
            return instance.getBuilder();
          })
          .filter((subCommand) => subCommand !== null)
          .forEach((subCommand) => {
            builder.addSubcommand(subCommand);
          });
      }

      if ("groups" in command) {
        for (const group of command.groups) {
          const groupBuilder = group.builder;
          group.subcommands
            .map((subCommand) => {
              const instance = this.resolve(subCommand);
              if (!instance.getEnabled()) return null;
              return instance.getBuilder();
            })
            .filter((subCommand) => subCommand !== null)
            .forEach((subCommand) => {
              groupBuilder.addSubcommand(subCommand);
            });
          builder.addSubcommandGroup(groupBuilder);
        }
      }

      payload.push(builder);
    }

    return payload;
  }
}
