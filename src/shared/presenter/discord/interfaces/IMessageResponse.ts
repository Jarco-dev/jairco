import type { InteractionReplyOptions, MessageFlags } from "discord.js";

export type IMessageResponse = {
  components: NonNullable<InteractionReplyOptions["components"]>;
  flags?: (MessageFlags.IsComponentsV2 | MessageFlags.SuppressEmbeds)[];
};
