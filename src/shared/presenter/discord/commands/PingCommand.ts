import {
  type ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { injectable } from "inversify";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import { CommandHandler } from "@/shared/presenter/discord/interfaces/CommandHandler.ts";
import { SuccessMessage } from "@/shared/presenter/discord/messages/SuccessMessage.ts";

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

  async handle(
    i: ChatInputCommandInteraction,
  ): Promise<ResultType<void, AppError>> {
    const explain = i.options.getBoolean("explain");
    const wsPing = Math.round(i.client.ws.ping);

    const content = explain
      ? `Pong! Gateway latency: \`${wsPing}ms\`.\nThis reflects the delay between the bot and Discord's servers, not your own connection.`
      : `Pong! \`${wsPing}ms\``;

    await i.reply(new SuccessMessage(content).build());

    return okRes(undefined);
  }
}
