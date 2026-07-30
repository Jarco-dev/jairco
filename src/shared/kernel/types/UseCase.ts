import type { AppError } from "@/shared/kernel/errors/AppError.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export interface UseCase<I, O> {
  execute(input: I): Promise<ResultType<O, AppError>>;
}
