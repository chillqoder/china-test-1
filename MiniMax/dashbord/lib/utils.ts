import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: string): string {
  if (currencyCode === 'VND' || currencyCode === 'IDR' || currencyCode === 'KHR' || currencyCode === 'MMK' || currencyCode === 'LAK') {
    return `${Math.round(amount * getUsdRate(currencyCode)).toLocaleString()} ${currencyCode}`;
  }
  return `${amount.toFixed(2)} ${currencyCode}`;
}

function getUsdRate(code: string): number {
  const rates: Record<string, number> = {
    THB: 35.5,
    VND: 25500,
    IDR: 16500,
    MYR: 4.7,
    PHP: 56,
    KHR: 4100,
    LAK: 21000,
    MMK: 2100,
  };
  return rates[code] || 1;
}

export function formatLocalCurrency(amount: number, currencyCode: string): string {
  const rate = getUsdRate(currencyCode);
  const localAmount = Math.round(amount * rate);
  if (localAmount >= 1000000) {
    return `${(localAmount / 1000000).toFixed(1)}M ${currencyCode}`;
  }
  if (localAmount >= 1000) {
    return `${(localAmount / 1000).toFixed(0)}K ${currencyCode}`;
  }
  return `${localAmount} ${currencyCode}`;
}
