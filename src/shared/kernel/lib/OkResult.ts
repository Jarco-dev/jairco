import type { ErrResult } from "@/shared/kernel/lib/ErrResult.ts";

export class OkResult<T, E> {
  constructor(public readonly value: T) {}

  isOk(): this is OkResult<T, E> {
    return true;
  }

  isErr(): this is ErrResult<T, E> {
    return false;
  }

  // Helper: Extract value (throws if ErrResult - Be careful)
  unwrap(): T {
    return this.value;
  }

  // Helper: Extract value with fallback
  unwrapOr(_defaultValue: T): T {
    return this.value;
  }
}

export const okRes = <T, E>(value: T): OkResult<T, E> => new OkResult(value);
