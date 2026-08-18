import {
  ApplicationCommandType,
  type ContextMenuCommandBuilder,
  type ContextMenuCommandInteraction,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction,
} from "discord.js";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { MaybePromise } from "@/shared/kernel/types/MaybePromise.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import type { AppBitFieldResolvable } from "@/shared/kernel/values/AppPermissionBitField.ts";
import { Handler } from "@/shared/presenter/discord/interfaces/Handler.ts";

export abstract class ContextMenuHandler extends Handler {
  abstract readonly type: ApplicationCommandType;
  abstract getBuilder(): ContextMenuCommandBuilder;
  abstract getPermissions(): AppBitFieldResolvable;
  abstract handle(
    i: ContextMenuCommandInteraction,
  ): MaybePromise<ResultType<void, AppError>>;
}

export abstract class UserContextMenuHandler extends ContextMenuHandler {
  readonly type = ApplicationCommandType.User;
  abstract handle(
    i: UserContextMenuCommandInteraction,
  ): MaybePromise<ResultType<void, AppError>>;
}

export abstract class MessageContextMenuHandler extends ContextMenuHandler {
  readonly type = ApplicationCommandType.Message;
  abstract handle(
    i: MessageContextMenuCommandInteraction,
  ): MaybePromise<ResultType<void, AppError>>;
}
