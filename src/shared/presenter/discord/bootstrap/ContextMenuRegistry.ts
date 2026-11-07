import {
  type ApplicationCommandDataResolvable,
  ApplicationCommandType,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction,
} from "discord.js";
import { inject, injectable, multiInject, optional } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { Logger } from "@/shared/application/interfaces/Logger.ts";
import type { Translator } from "@/shared/application/interfaces/Translator.ts";
import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { errRes } from "@/shared/kernel/lib/ErrResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import type { ContextMenuHandler } from "@/shared/presenter/discord/interfaces/ContextMenuHandler.ts";
import { AppErrorMessage } from "@/shared/presenter/discord/messages/shared/AppErrorMessage.ts";
import { PermissionChecker } from "@/shared/presenter/discord/services/PermissionChecker.ts";
import { resolveLocale } from "@/shared/presenter/discord/services/resolveLocale.ts";

@injectable()
export class ContextMenuRegistry {
  private readonly byKey: Map<string, ContextMenuHandler>;

  constructor(
    @inject(DiTypes.shared.Logger) private logger: Logger,
    @inject(DiTypes.shared.Translator) private translator: Translator,
    @inject(PermissionChecker) private permissions: PermissionChecker,
    @multiInject(DiTypes.discord.ContextMenu)
    @optional()
    handlers: ContextMenuHandler[] = [],
  ) {
    this.byKey = new Map();

    for (const handler of handlers) {
      if (!handler.getEnabled()) continue;

      const name = handler.getBuilder().name;
      const key = this.key(handler.type, name);
      if (this.byKey.has(key)) {
        throw new Error(
          `[ContextMenuRegistry] Duplicate ${this.getHumanizedType(handler)} context menu "${name}"`,
        );
      }

      this.byKey.set(key, handler);
      this.logger.verbose(
        `[ContextMenuRegistry] Registered ${this.getHumanizedType(handler)} context menu: ${name}`,
      );
    }

    const userMenuCount = [...this.byKey.values()].filter(
      (h) => h.type === ApplicationCommandType.User,
    ).length;
    const messageMenuCount = [...this.byKey.values()].filter(
      (h) => h.type === ApplicationCommandType.Message,
    ).length;
    this.logger.info(
      `[ContextMenuRegistry] Registered ${userMenuCount} user and ${messageMenuCount} message context menu(s)`,
    );
  }

  async dispatchInteractionEvent(
    i: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction,
  ): Promise<ResultType<void, AppError>> {
    const handler = this.byKey.get(this.key(i.commandType, i.commandName));
    if (!handler) {
      return errRes(
        AppError.notFound(
          "[ContextMenuRegistry] Context menu not found in interaction dispatcher",
          { name: i.commandName, type: i.commandType },
        ),
      );
    }

    if (i.inGuild()) {
      const hasPerms = await this.permissions.check(
        i,
        handler.getPermissions(),
      );

      if (hasPerms.isErr()) {
        const t = this.translator.forLocale(resolveLocale(i));
        i.reply(new AppErrorMessage(t, hasPerms.error).build());
        return errRes(hasPerms.error);
      }

      if (!hasPerms.value) {
        const t = this.translator.forLocale(resolveLocale(i));
        const error = AppError.unauthorized("User is missing permissions");
        i.reply(new AppErrorMessage(t, error).build());
        return errRes(error);
      }
    }

    this.logger.verbose(
      `[ContextMenuRegistry] Running "${i.commandName}" ${this.getHumanizedType(handler)} context menu`,
    );
    return handler.handle(i);
  }

  getDeployPayload(): ApplicationCommandDataResolvable[] {
    return [...this.byKey.values()].map((handler) => handler.getBuilder());
  }

  private key(type: number, name: string): string {
    return `${type}:${name}`;
  }

  private getHumanizedType(handler: ContextMenuHandler): string {
    return handler.type === ApplicationCommandType.User ? "user" : "message";
  }
}
