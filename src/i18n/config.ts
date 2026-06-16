export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "th";

export const localeNames: Record<Locale, string> = {
  th: "ไทย",
  en: "English",
};

// BCP-47 tags for HeroUI I18nProvider (date/number formatting, a11y).
export const localeToBcp47: Record<Locale, string> = {
  th: "th-TH",
  en: "en-US",
};
