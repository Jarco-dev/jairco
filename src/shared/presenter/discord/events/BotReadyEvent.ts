import type { Client } from "discord.js";
import { inject, injectable } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import { CommandRegistry } from "@/shared/presenter/discord/bootstrap/CommandRegistry.ts";
import { IEventHandler } from "@/shared/presenter/discord/interfaces/IEventHandler.ts";

@injectable()
export class BotReadyEvent extends IEventHandler<"clientReady"> {
  readonly event = "clientReady" as const;
  readonly once = true;

  constructor(
    @inject(DiTypes.shared.Logger) private logger: ILogger,
    @inject(DiTypes.discord.Client) private client: Client<true>,
    @inject(CommandRegistry) private commandRegistry: CommandRegistry,
  ) {
    super();
  }

  async handle(): Promise<ResultType<void, AppError>> {
    this.logger.info(`[Bootstrap] ${this.client.user.username} logged in`);

    const payload = this.commandRegistry.getDeployPayload();
    this.client.application.commands.set(payload).then(() => {
      this.logger.info(
        `[CommandRegistry] Updated ${payload.length} global application command(s)`,
      );
    });

    return okRes(undefined);
  }
}
