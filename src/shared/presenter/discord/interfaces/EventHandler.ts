import type { ClientEvents } from "discord.js";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { MaybePromise } from "@/shared/kernel/types/MaybePromise.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import { Handler } from "@/shared/presenter/discord/interfaces/Handler.ts";

export abstract class EventHandler<
  Event extends keyof ClientEvents,
> extends Handler {
  abstract readonly event: Event;
  readonly once: boolean = false;
  abstract handle(
    ...args: ClientEvents[Event]
  ): MaybePromise<ResultType<void, AppError>>;
}

export type AnyEventHandler = EventHandler<keyof ClientEvents>;
