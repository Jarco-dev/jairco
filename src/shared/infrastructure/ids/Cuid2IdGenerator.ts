import { createId } from "@paralleldrive/cuid2";
import { injectable } from "inversify";
import type { IdGenerator } from "@/shared/application/interfaces/IdGenerator.ts";

@injectable()
export class Cuid2IdGenerator implements IdGenerator {
  generate(): string {
    return createId();
  }
}
