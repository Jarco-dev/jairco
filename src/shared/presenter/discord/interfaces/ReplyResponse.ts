import type { MessageFlags } from "discord.js";
import type { MessageResponse } from "@/shared/presenter/discord/interfaces/MessageResponse.ts";

export type ReplyResponse = Omit<MessageResponse, "flags"> & {
  flags?: (
    | MessageFlags.IsComponentsV2
    | MessageFlags.SuppressEmbeds
    | MessageFlags.Ephemeral
  )[];
};
