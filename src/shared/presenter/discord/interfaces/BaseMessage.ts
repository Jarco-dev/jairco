import type { MessageResponse } from "@/shared/presenter/discord/interfaces/MessageResponse.ts";
import type { ReplyResponse } from "@/shared/presenter/discord/interfaces/ReplyResponse.ts";
import type { UpdateResponse } from "@/shared/presenter/discord/interfaces/UpdateResponse.ts";

export abstract class BaseMessage {
  abstract build(): MessageResponse | ReplyResponse | UpdateResponse;
}
