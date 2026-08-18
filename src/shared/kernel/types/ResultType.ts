import type { ErrResult } from "@/shared/kernel/lib/ErrResult.ts";
import type { OkResult } from "@/shared/kernel/lib/OkResult.ts";

export type ResultType<T, E> = OkResult<T, E> | ErrResult<T, E>;
