import type { Interaction } from "discord.js";
import { inject, injectable } from "inversify";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { MaybePromise } from "@/shared/kernel/types/MaybePromise.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import { CommandRegistry } from "@/shared/presenter/discord/bootstrap/CommandRegistry.ts";
import { EventHandler } from "@/shared/presenter/discord/interfaces/EventHandler.ts";

@injectable()
export class InteractionRouterEvent extends EventHandler<"interactionCreate"> {
  readonly event = "interactionCreate" as const;

  constructor(
    @inject(CommandRegistry) private commandRegistry: CommandRegistry,
  ) {
    super();
  }

  handle(i: Interaction): MaybePromise<ResultType<void, AppError>> {
    if (i.isChatInputCommand() || i.isAutocomplete()) {
      return this.commandRegistry.dispatchInteractionEvent(i);
    }

    return okRes(undefined);
  }
}
