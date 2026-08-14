import {
  type AppError,
  AppErrorCodes,
} from "@/shared/kernel/errors/AppError.ts";
import { IBaseReplyMessage } from "@/shared/presenter/discord/interfaces/IBaseReplyMessage.ts";
import type { IReplyResponse } from "@/shared/presenter/discord/interfaces/IReplyResponse.ts";
import { ErrorMessage } from "@/shared/presenter/discord/messages/ErrorMessage.ts";

const titles: Record<AppErrorCodes, string> = {
  [AppErrorCodes.ValidationFailed]: "Invalid input",
  [AppErrorCodes.NotFound]: "Not found",
  [AppErrorCodes.Unauthorized]: "Access denied",
  [AppErrorCodes.Conflict]: "Conflict",
  [AppErrorCodes.InternalError]: "Something went wrong",
};

export class AppErrorMessage extends IBaseReplyMessage {
  constructor(private readonly error: AppError) {
    super();
  }

  build(): IReplyResponse {
    const title =
      titles[this.error.code as AppErrorCodes] ??
      titles[AppErrorCodes.InternalError];

    return new ErrorMessage(`**${title}**\n${this.error.message}`).build();
  }
}
