import type { MessageFlags } from "discord.js";
import type { IMessageResponse } from "@/shared/presenter/discord/interfaces/IMessageResponse.ts";

export type IReplyResponse = Omit<IMessageResponse, "flags"> & {
  flags?: (
    | MessageFlags.IsComponentsV2
    | MessageFlags.SuppressEmbeds
    | MessageFlags.Ephemeral
  )[];
};
