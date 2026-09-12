import enMessages from '../../messages/en.json';
import kmMessages from '../../messages/km.json';

export const locales = ['km', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'km';

export const dictionaries = {
  en: enMessages,
  km: kmMessages,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries[defaultLocale];
}
