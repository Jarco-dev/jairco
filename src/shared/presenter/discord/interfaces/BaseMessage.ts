import type { MessageResponse } from "@/shared/presenter/discord/interfaces/MessageResponse.ts";

export abstract class BaseMessage {
  abstract build(): MessageResponse;
}
