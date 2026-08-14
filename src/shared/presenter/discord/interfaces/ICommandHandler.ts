import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { MaybePromise } from "@/shared/kernel/types/MaybePromise.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import {
  type AppBitFieldResolvable,
  AppPermissionBitField,
} from "@/shared/kernel/values/AppPermissionBitField.ts";
import { IHandler } from "@/shared/presenter/discord/interfaces/IHandler.ts";

export abstract class ICommandHandler extends IHandler {
  abstract getBuilder(): SlashCommandSubcommandBuilder;

  getGuildOnly(): boolean {
    return false;
  }

  getPermissions(): AppBitFieldResolvable {
    return AppPermissionBitField.DefaultBit;
  }

  abstract handle(
    i: ChatInputCommandInteraction,
  ): MaybePromise<ResultType<void, AppError>>;

  handleAutoComplete(
    // biome-ignore lint/correctness/noUnusedFunctionParameters: default no-op implementation
    i: AutocompleteInteraction,
  ): MaybePromise<ResultType<void, AppError>> {
    return okRes(undefined);
  }
}
