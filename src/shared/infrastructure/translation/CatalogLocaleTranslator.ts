import type { Logger } from "@/shared/application/interfaces/Logger.ts";
import type { TranslationCatalog } from "@/shared/application/interfaces/TranslationCatalog.ts";
import type {
  LocaleTranslator,
  TranslationKey,
  TranslationParams,
} from "@/shared/application/interfaces/Translator.ts";

export class CatalogLocaleTranslator implements LocaleTranslator {
  private readonly INTERPOLATION_PATTERN = /\{\{\s*(\w+)\s*}}/g;

  constructor(
    private readonly catalog: TranslationCatalog,
    private readonly fallback: TranslationCatalog,
    private readonly logger: Logger,
  ) {}

  get(key: TranslationKey, params?: TranslationParams): string {
    const template =
      this.lookup(this.catalog, key) ?? this.lookup(this.fallback, key);

    if (template === undefined) {
      this.logger.warn(`[Translator] Missing translation for key "${key}"`);
      return key;
    }

    return this.interpolate(template, params);
  }

  private lookup(catalog: TranslationCatalog, key: string): string | undefined {
    let current: unknown = catalog;
    for (const segment of key.split(".")) {
      if (typeof current !== "object" || current === null) return undefined;
      current = (current as Record<string, unknown>)[segment];
    }
    return typeof current === "string" ? current : undefined;
  }

  private interpolate(template: string, params?: TranslationParams): string {
    if (!params) return template;
    return template.replace(
      this.INTERPOLATION_PATTERN,
      (match, name: string) => {
        const value = params[name];
        return value === undefined ? match : String(value);
      },
    );
  }
}
