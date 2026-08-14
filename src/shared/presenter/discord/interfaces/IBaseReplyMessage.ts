import type { IReplyResponse } from "@/shared/presenter/discord/interfaces/IReplyResponse.ts";

export abstract class IBaseReplyMessage {
  abstract build(): IReplyResponse;
}
