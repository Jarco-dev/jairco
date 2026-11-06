import type { Interaction } from "discord.js";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/shared/application/translation/locales.ts";

export function resolveLocale(i: Interaction): SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(i.locale)
    ? (i.locale as SupportedLocale)
    : DEFAULT_LOCALE;
}
