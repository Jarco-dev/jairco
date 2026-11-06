import { inject, injectable } from "inversify";
import type { Logger } from "@/shared/application/interfaces/Logger.ts";
import type {
  LocaleTranslator,
  Translator,
} from "@/shared/application/interfaces/Translator.ts";
import {
  DEFAULT_LOCALE,
  type SupportedLocale,
} from "@/shared/application/translation/locales.ts";
import { CatalogLocaleTranslator } from "@/shared/infrastructure/translation/CatalogLocaleTranslator.ts";
import { catalogs } from "@/shared/infrastructure/translation/catalogs/index.ts";
import { SharedDiTypes } from "@/shared/SharedDiTypes.ts";

@injectable()
export class CatalogTranslator implements Translator {
  private readonly byLocale = new Map<SupportedLocale, LocaleTranslator>();

  constructor(@inject(SharedDiTypes.Logger) private logger: Logger) {}

  forLocale(locale: SupportedLocale): LocaleTranslator {
    const cached = this.byLocale.get(locale);
    if (cached) return cached;

    const translator = new CatalogLocaleTranslator(
      catalogs[locale],
      catalogs[DEFAULT_LOCALE],
      this.logger,
    );
    this.byLocale.set(locale, translator);
    return translator;
  }
}
