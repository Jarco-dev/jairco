import { ContainerBuilder, MessageFlags } from "discord.js";
import { BaseReplyMessage } from "@/shared/presenter/discord/interfaces/BaseReplyMessage.ts";
import type { ReplyResponse } from "@/shared/presenter/discord/interfaces/ReplyResponse.ts";

export class ErrorMessage extends BaseReplyMessage {
  private static readonly ACCENT_COLOR = 0xff0000;

  constructor(private readonly content: string) {
    super();
  }

  build(): ReplyResponse {
    const container = new ContainerBuilder()
      .setAccentColor(ErrorMessage.ACCENT_COLOR)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(this.content),
      );

    return {
      components: [container],
      flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
    };
  }
}
