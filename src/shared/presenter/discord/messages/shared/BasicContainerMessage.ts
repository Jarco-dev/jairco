import { ContainerBuilder, MessageFlags } from "discord.js";
import type {
  LocaleTranslator,
  TranslationKey,
  TranslationParams,
} from "@/shared/application/interfaces/Translator.ts";
import type { BaseMessage } from "@/shared/presenter/discord/interfaces/BaseMessage.ts";
import type { MessageResponse } from "@/shared/presenter/discord/interfaces/MessageResponse.ts";
import { COLORS } from "@/shared/presenter/discord/messages/shared/MessageColors.ts";

export class BasicContainerMessage implements BaseMessage {
  constructor(
    private readonly t: LocaleTranslator,
    private readonly keys: {
      title: TranslationKey;
      description: TranslationKey;
    },
    private readonly params?: TranslationParams,
  ) {}

  build(): MessageResponse {
    const container = new ContainerBuilder()
      .setAccentColor(COLORS.default)
      .setSpoiler(true);

    if (this.keys.title) {
      container.addTextDisplayComponents((c) =>
        c.setContent(`### ${this.t.get(this.keys.title, this.params)}`),
      );
    }

    if (this.keys.description) {
      if (this.keys.title) container.addSectionComponents();
      container.addTextDisplayComponents((c) =>
        c.setContent(this.t.get(this.keys.description, this.params)),
      );
    }

    return {
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    };
  }
}
