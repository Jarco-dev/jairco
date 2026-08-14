import { ContainerBuilder, MessageFlags } from "discord.js";
import { IBaseMessage } from "@/shared/presenter/discord/interfaces/IBaseMessage.ts";
import type { IMessageResponse } from "@/shared/presenter/discord/interfaces/IMessageResponse.ts";

export class SuccessMessage extends IBaseMessage {
  private static readonly ACCENT_COLOR = 0x00ff00;

  constructor(private readonly content: string) {
    super();
  }

  build(): IMessageResponse {
    const container = new ContainerBuilder()
      .setAccentColor(SuccessMessage.ACCENT_COLOR)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(this.content),
      );

    return {
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    };
  }
}
