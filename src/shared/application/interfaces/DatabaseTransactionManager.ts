import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export interface DatabaseTransactionManager {
  run<T>(callback: () => Promise<T>): Promise<ResultType<T, AppError>>;
}
