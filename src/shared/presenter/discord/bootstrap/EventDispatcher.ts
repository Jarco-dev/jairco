import type { Client, ClientEvents } from "discord.js";
import { inject, injectable, multiInject } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { ILogger } from "@/shared/application/interfaces/ILogger.ts";
import { AppErrorCodes } from "@/shared/kernel/errors/AppError.ts";
import type { AnyEventHandler } from "@/shared/presenter/discord/interfaces/IEventHandler.ts";

@injectable()
export class EventDispatcher {
  private readonly byEvent = new Map<keyof ClientEvents, AnyEventHandler[]>();

  constructor(
    @inject(DiTypes.shared.Logger) private logger: ILogger,
    @inject(DiTypes.discord.Client) private client: Client,
    @multiInject(DiTypes.discord.Event) events: AnyEventHandler[],
  ) {
    let handlerCount = 0;
    for (const event of events) {
      if (!event.getEnabled()) continue;

      const existing = this.byEvent.get(event.event);
      if (existing) existing.push(event);
      else this.byEvent.set(event.event, [event]);

      handlerCount++;
      this.logger.verbose(
        `[EventDispatcher] Registered event: ${event.constructor.name} (${event.event})`,
      );
    }

    this.logger.info(
      `[EventDispatcher] Registered ${handlerCount} handlers using ${this.byEvent.size} events`,
    );
  }

  attachHandlers() {
    for (const [event, eventHandlers] of this.byEvent) {
      const once = eventHandlers.filter((e) => e.once);
      if (once.length > 0) {
        this.client.once(event, (...args: ClientEvents[keyof ClientEvents]) => {
          this.logger.verbose(
            `[EventDispatcher] Running ${once.length} handler(s) once for "${event}" event`,
          );
          Promise.all(once.map((handler) => this.runHandler(handler, args)));
        });
      }

      const on = eventHandlers.filter((e) => !e.once);
      if (on.length > 0) {
        this.client.on(event, (...args: ClientEvents[keyof ClientEvents]) => {
          this.logger.verbose(
            `[EventDispatcher] Running ${on.length} handler(s) for "${event}" event`,
          );
          Promise.all(on.map((handler) => this.runHandler(handler, args)));
        });
      }
    }
  }

  async runHandler(
    handler: AnyEventHandler,
    args: ClientEvents[keyof ClientEvents],
  ): Promise<void> {
    try {
      const result = await handler.handle(...args);

      if (result.isErr() && result.error.code === AppErrorCodes.InternalError) {
        this.logger.error(
          "[EventDispatcher] Event handler returned an internal error",
          {
            error: result.error,
            event: handler.event,
            handler: handler.constructor.name,
          },
        );
      }
    } catch (error) {
      this.logger.error("[EventDispatcher] Error handler threw an error", {
        error,
        event: handler.event,
        handler: handler.constructor.name,
      });
    }
  }
}
