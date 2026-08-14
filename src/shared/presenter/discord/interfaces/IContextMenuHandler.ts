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
import { IHandler } from "@/shared/presenter/discord/interfaces/IHandler.ts";

export abstract class IContextMenuHandler extends IHandler {
  abstract readonly type: ApplicationCommandType;
  abstract getBuilder(): ContextMenuCommandBuilder;
  abstract getPermissions(): AppBitFieldResolvable;
  abstract handle(
    i: ContextMenuCommandInteraction,
  ): MaybePromise<ResultType<void, AppError>>;
}

export abstract class IUserContextMenuHandler extends IContextMenuHandler {
  readonly type = ApplicationCommandType.User;
  abstract handle(
    i: UserContextMenuCommandInteraction,
  ): MaybePromise<ResultType<void, AppError>>;
}

export abstract class IMessageContextMenuHandler extends IContextMenuHandler {
  readonly type = ApplicationCommandType.Message;
  abstract handle(
    i: MessageContextMenuCommandInteraction,
  ): MaybePromise<ResultType<void, AppError>>;
}
