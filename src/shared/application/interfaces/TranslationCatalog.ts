import type { AppErrorCodes } from "@/shared/kernel/errors/AppError.ts";

export interface TranslationCatalog {
  errors: { title: Record<AppErrorCodes, string> };
  commands: {
    ping: {
      result: { title: string; description: string };
      explanation: { title: string; description: string };
    };
  };
}
