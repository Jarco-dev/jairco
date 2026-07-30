import { createId } from "@paralleldrive/cuid2";
import { injectable } from "inversify";
import type { IIdGenerator } from "@/shared/application/interfaces/IIdGenerator.ts";

@injectable()
export class Cuid2IdGenerator implements IIdGenerator {
  generate(): string {
    return createId();
  }
}
