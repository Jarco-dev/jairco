import type { TranslationCatalog } from "@/shared/application/interfaces/TranslationCatalog.ts";
import type { SupportedLocale } from "@/shared/application/translation/locales.ts";
import type { DotPaths } from "@/shared/kernel/types/DotPaths.ts";

export type TranslationKey = DotPaths<TranslationCatalog>;

export type TranslationParams = Record<string, string | number>;

export interface LocaleTranslator {
  get(key: TranslationKey, params?: TranslationParams): string;
}

export interface Translator {
  forLocale(locale: SupportedLocale): LocaleTranslator;
}
