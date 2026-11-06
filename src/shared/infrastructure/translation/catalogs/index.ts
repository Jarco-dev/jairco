import type { TranslationCatalog } from "@/shared/application/interfaces/TranslationCatalog.ts";
import type { SupportedLocale } from "@/shared/application/translation/locales.ts";
import { enUS } from "@/shared/infrastructure/translation/catalogs/en-US.ts";
import { nl } from "@/shared/infrastructure/translation/catalogs/nl.ts";

export const catalogs: Record<SupportedLocale, TranslationCatalog> = {
  "en-US": enUS,
  nl,
};
