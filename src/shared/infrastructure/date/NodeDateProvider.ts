import { injectable } from "inversify";
import type { IDateProvider } from "@/shared/application/interfaces/IDateProvider.ts";

@injectable()
export class NodeDateProvider implements IDateProvider {
  now(): Date {
    return new Date();
  }

  addSeconds(seconds: number, from?: Date): Date {
    const date = from ?? this.now();
    date.setSeconds(date.getSeconds() + seconds);
    return date;
  }
}
