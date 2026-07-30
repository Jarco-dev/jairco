import type { OkResult } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export class ErrResult<T, E> {
  constructor(public readonly error: E) {}

  isOk(): this is OkResult<T, E> {
    return false;
  }

  isErr(): this is ErrResult<T, E> {
    return true;
  }

  // Helper: Throw the error (prefer explicit handling)
  unwrap(): never {
    throw this.error;
  }

  // Helper: Return fallback value
  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }
}

export const errRes = <T, E>(error: E): ResultType<T, E> =>
  new ErrResult(error);
