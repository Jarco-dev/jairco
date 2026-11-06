import type { ReplyResponse } from "@/shared/presenter/discord/interfaces/ReplyResponse.ts";

export interface BaseReplyMessage {
  build(): ReplyResponse;
}
