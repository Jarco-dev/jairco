import type { InteractionReplyOptions, MessageFlags } from "discord.js";

export type MessageResponse = {
  components: NonNullable<InteractionReplyOptions["components"]>;
  flags?: (MessageFlags.IsComponentsV2 | MessageFlags.SuppressEmbeds)[];
};
