import { ContainerBuilder, MessageFlags } from "discord.js";
import { BaseMessage } from "@/shared/presenter/discord/interfaces/BaseMessage.ts";
import type { MessageResponse } from "@/shared/presenter/discord/interfaces/MessageResponse.ts";

export class SuccessMessage extends BaseMessage {
  private static readonly ACCENT_COLOR = 0x00ff00;

  constructor(private readonly content: string) {
    super();
  }

  build(): MessageResponse {
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
