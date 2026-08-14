import { ContainerBuilder, MessageFlags } from "discord.js";
import { IBaseReplyMessage } from "@/shared/presenter/discord/interfaces/IBaseReplyMessage.ts";
import type { IReplyResponse } from "@/shared/presenter/discord/interfaces/IReplyResponse.ts";

export class ErrorMessage extends IBaseReplyMessage {
  private static readonly ACCENT_COLOR = 0xff0000;

  constructor(private readonly content: string) {
    super();
  }

  build(): IReplyResponse {
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
