import { injectable } from "inversify";
import type { DateProvider } from "@/shared/application/interfaces/DateProvider.ts";

@injectable()
export class NodeDateProvider implements DateProvider {
  now(): Date {
    return new Date();
  }

  addSeconds(seconds: number, from?: Date): Date {
    const date = from ?? this.now();
    date.setSeconds(date.getSeconds() + seconds);
    return date;
  }
}
