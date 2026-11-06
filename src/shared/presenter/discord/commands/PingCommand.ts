import {
  type ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { inject, injectable } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { Translator } from "@/shared/application/interfaces/Translator.ts";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import { CommandHandler } from "@/shared/presenter/discord/interfaces/CommandHandler.ts";
import type { MessageResponse } from "@/shared/presenter/discord/interfaces/MessageResponse.ts";
import { BasicContainerMessage } from "@/shared/presenter/discord/messages/shared/BasicContainerMessage.ts";
import { resolveLocale } from "@/shared/presenter/discord/services/resolveLocale.ts";

@injectable()
export class PingCommand extends CommandHandler {
  getBuilder(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("ping")
      .setDescription("Check the latency")
      .addBooleanOption((option) =>
        option
          .setName("explain")
          .setDescription("Explains the values when enabled"),
      );
  }

  constructor(
    @inject(DiTypes.shared.Translator) private translator: Translator,
  ) {
    super();
  }

  async handle(
    i: ChatInputCommandInteraction,
  ): Promise<ResultType<void, AppError>> {
    const t = this.translator.forLocale(resolveLocale(i));
    const explain = i.options.getBoolean("explain");
    const wsPing = Math.round(i.client.ws.ping);

    let response: MessageResponse;
    if (!explain) {
      response = new BasicContainerMessage(
        t,
        {
          title: "commands.ping.result.title",
          description: "commands.ping.result.description",
        },
        {
          heartbeat: wsPing.toString(),
        },
      ).build();
    } else {
      response = new BasicContainerMessage(t, {
        title: "commands.ping.explanation.title",
        description: "commands.ping.explanation.description",
      }).build();
    }
    i.reply(response);

    return okRes(undefined);
  }
}
