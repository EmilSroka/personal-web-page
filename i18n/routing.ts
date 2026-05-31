import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pl", "uk", "ar", "he"],
  defaultLocale: "pl",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

// Locales written right-to-left. Used to set `dir` on <html>.
const rtlLocales: readonly string[] = ["ar", "he"];

export function getLocaleDir(locale: string): "rtl" | "ltr" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
