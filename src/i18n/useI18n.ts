import { useMemo } from 'react';
import { useWorkspace } from '../store/WorkspaceContext';
import { fa } from './translations';
import type { PlanId } from '../types';

export type Language = 'en' | 'fa';

export function useI18n() {
  const { data } = useWorkspace();
  const language: Language = data.preferences.language === 'fa' ? 'fa' : 'en';
  return useMemo(() => {
    const locale = language === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US';
    const numberLocale = language === 'fa' ? 'fa-IR' : 'en-US';
    const t = (input: string): string => {
      if (language === 'en') return input;
      const match = input.match(/^(\s*)([\s\S]*?)(\s*)$/);
      if (!match) return input;
      const translated = fa[match[2]];
      return translated === undefined ? input : `${match[1]}${translated}${match[3]}`;
    };
    const number = (value: number) => new Intl.NumberFormat(numberLocale).format(value);
    const currency = (value: number) => new Intl.NumberFormat(numberLocale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    const shortCurrency = (value: number) => new Intl.NumberFormat(numberLocale, { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
    const date = (value: string) => new Date(value).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    const shortDate = (value: string) => new Date(value).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    const time = (value: string) => new Date(value).toLocaleTimeString(numberLocale, { hour: 'numeric', minute: '2-digit' });
    const monthLabel = (key: string) => new Date(`${key}-01T12:00:00`).toLocaleDateString(locale, { month: 'short' });
    const planName = (id: PlanId) => t(id.charAt(0).toUpperCase() + id.slice(1));
    return { language, t, number, currency, shortCurrency, date, shortDate, time, monthLabel, planName };
  }, [language]);
}

export function useT() {
  return useI18n().t;
}
