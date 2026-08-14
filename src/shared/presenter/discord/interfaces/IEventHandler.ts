import type { ClientEvents } from "discord.js";
import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { MaybePromise } from "@/shared/kernel/types/MaybePromise.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";
import { IHandler } from "@/shared/presenter/discord/interfaces/IHandler.ts";

export abstract class IEventHandler<
  Event extends keyof ClientEvents,
> extends IHandler {
  abstract readonly event: Event;
  readonly once: boolean = false;
  abstract handle(
    ...args: ClientEvents[Event]
  ): MaybePromise<ResultType<void, AppError>>;
}

export type AnyEventHandler = IEventHandler<keyof ClientEvents>;
