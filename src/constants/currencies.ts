// src\constants\currencies.ts
// Salary currencies. Shared by the Settings form (dropdown) and settings validation.
// currencies.json is a static ISO 4217 list (code → English name), generated once from Node's Intl
// so server and browser always show the same labels.
import CURRENCY_NAMES from '@/constants/currencies.json';

export const DEFAULT_CURRENCY = 'PHP';

/** Shown first, in this order. */
export const COMMON_CURRENCIES = ['PHP', 'USD', 'SGD', 'AUD', 'EUR', 'GBP'] as const;

export const CURRENCY_CODES: readonly string[] = Object.keys(CURRENCY_NAMES);

const NAMES: Record<string, string> = CURRENCY_NAMES;

/** True if `code` is a supported ISO currency code. */
export const isCurrencyCode = (code: string): boolean => code in NAMES;

/** "PHP — Philippine Peso" */
export const currencyLabel = (code: string): string => (NAMES[code] ? `${code} — ${NAMES[code]}` : code);

const COMMON_SET = new Set<string>(COMMON_CURRENCIES);

/** Dropdown options: common currencies first, then every other currency A–Z. */
export const CURRENCY_OPTIONS = [
  ...COMMON_CURRENCIES.map((code) => ({ value: code, label: currencyLabel(code), group: 'Common' })),
  ...CURRENCY_CODES.filter((code) => !COMMON_SET.has(code))
    .sort()
    .map((code) => ({ value: code, label: currencyLabel(code), group: 'All currencies' })),
];
