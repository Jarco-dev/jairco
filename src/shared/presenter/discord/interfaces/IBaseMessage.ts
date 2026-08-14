import type { IMessageResponse } from "@/shared/presenter/discord/interfaces/IMessageResponse.ts";

export abstract class IBaseMessage {
  abstract build(): IMessageResponse;
}
