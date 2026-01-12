export const locales = ['ms', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ms';

export const localeNames: Record<Locale, string> = {
  ms: 'Melayu',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  ms: '🇲🇾',
  en: '🇬🇧',
};
