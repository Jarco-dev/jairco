import {
  type AppError,
  AppErrorCodes,
} from "@/shared/kernel/errors/AppError.ts";
import { BaseReplyMessage } from "@/shared/presenter/discord/interfaces/BaseReplyMessage.ts";
import type { ReplyResponse } from "@/shared/presenter/discord/interfaces/ReplyResponse.ts";
import { ErrorMessage } from "@/shared/presenter/discord/messages/ErrorMessage.ts";

const titles: Record<AppErrorCodes, string> = {
  [AppErrorCodes.ValidationFailed]: "Invalid input",
  [AppErrorCodes.NotFound]: "Not found",
  [AppErrorCodes.Unauthorized]: "Access denied",
  [AppErrorCodes.Conflict]: "Conflict",
  [AppErrorCodes.InternalError]: "Something went wrong",
};

export class AppErrorMessage extends BaseReplyMessage {
  constructor(private readonly error: AppError) {
    super();
  }

  build(): ReplyResponse {
    const title =
      titles[this.error.code as AppErrorCodes] ??
      titles[AppErrorCodes.InternalError];

    return new ErrorMessage(`**${title}**\n${this.error.message}`).build();
  }
}
