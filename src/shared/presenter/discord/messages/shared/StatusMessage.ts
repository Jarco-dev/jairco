import { ContainerBuilder, MessageFlags } from "discord.js";
import type {
  LocaleTranslator,
  TranslationKey,
  TranslationParams,
} from "@/shared/application/interfaces/Translator.ts";
import type { BaseMessage } from "@/shared/presenter/discord/interfaces/BaseMessage.ts";
import type { MessageResponse } from "@/shared/presenter/discord/interfaces/MessageResponse.ts";
import { COLORS } from "@/shared/presenter/discord/messages/shared/MessageColors.ts";

export enum StatusMessageType {
  Success = "success",
  Error = "error",
}

interface StatusOptions {
  emoji: string;
  color: (typeof COLORS)[keyof typeof COLORS];
}

export class StatusMessage implements BaseMessage {
  private readonly statusOptions: Record<StatusMessageType, StatusOptions> = {
    success: { emoji: "✅", color: COLORS.success },
    error: { emoji: "❌", color: COLORS.error },
  };
  private options: StatusOptions;

  constructor(
    private readonly t: LocaleTranslator,
    type: StatusMessageType,
    private readonly key: TranslationKey,
    private readonly params?: TranslationParams,
  ) {
    this.options = this.statusOptions[type];
  }

  build(): MessageResponse {
    const content = this.t.get(this.key, this.params);
    const container = new ContainerBuilder()
      .setAccentColor(this.options.color)
      .addTextDisplayComponents((c) =>
        c.setContent(`${this.options.emoji}  ${content}`),
      );

    return {
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    };
  }
}
