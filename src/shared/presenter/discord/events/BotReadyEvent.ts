import type { Client } from "discord.js";
import { inject, injectable } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { Logger } from "@/shared/application/interfaces/Logger.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import { CommandRegistry } from "@/shared/presenter/discord/bootstrap/CommandRegistry.ts";
import { ContextMenuRegistry } from "@/shared/presenter/discord/bootstrap/ContextMenuRegistry.ts";
import { EventHandler } from "@/shared/presenter/discord/interfaces/EventHandler.ts";

@injectable()
export class BotReadyEvent extends EventHandler<"clientReady"> {
  readonly event = "clientReady" as const;
  readonly once = true;

  constructor(
    @inject(DiTypes.shared.Logger) private logger: Logger,
    @inject(DiTypes.discord.Client) private client: Client<true>,
    @inject(CommandRegistry) private commandRegistry: CommandRegistry,
    @inject(ContextMenuRegistry)
    private contextMenuRegistry: ContextMenuRegistry,
  ) {
    super();
  }

  async handle(): Promise<ResultType<void, AppError>> {
    this.logger.info(`[Bootstrap] ${this.client.user.username} logged in`);

    const commandPayload = this.commandRegistry.getDeployPayload();
    const contextMenuPayload = this.contextMenuRegistry.getDeployPayload();
    this.client.application.commands
      .set([...commandPayload, ...contextMenuPayload])
      .then(() => {
        this.logger.info(
          `[CommandRegistry] Updated ${commandPayload.length} global application command(s)`,
        );
        this.logger.info(
          `[ContextMenuRegistry] Updated ${contextMenuPayload.length} context menu command(s)`,
        );
      });

    return okRes(undefined);
  }
}
