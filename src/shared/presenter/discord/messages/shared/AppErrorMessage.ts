import type { LocaleTranslator } from "@/shared/application/interfaces/Translator.ts";
import type {
  AppError,
  AppErrorCodes,
} from "@/shared/kernel/errors/AppError.ts";
import type { BaseMessage } from "@/shared/presenter/discord/interfaces/BaseMessage.ts";
import type { MessageResponse } from "@/shared/presenter/discord/interfaces/MessageResponse.ts";
import {
  StatusMessage,
  StatusMessageType,
} from "@/shared/presenter/discord/messages/shared/StatusMessage.ts";

export class AppErrorMessage implements BaseMessage {
  constructor(
    private readonly t: LocaleTranslator,
    private readonly error: AppError,
  ) {}

  build(): MessageResponse {
    return new StatusMessage(
      this.t,
      StatusMessageType.Error,
      `errors.title.${this.error.code as AppErrorCodes}`,
    ).build();
  }
}
