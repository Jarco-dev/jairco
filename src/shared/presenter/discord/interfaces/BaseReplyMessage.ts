import type { ReplyResponse } from "@/shared/presenter/discord/interfaces/ReplyResponse.ts";

export abstract class BaseReplyMessage {
  abstract build(): ReplyResponse;
}
