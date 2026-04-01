import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CityData, CostCategory } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLocalCurrency(amountUSD: number, usdRate: number): string {
  const localAmount = amountUSD * usdRate;
  
  if (localAmount >= 1000000) {
    return `${(localAmount / 1000000).toFixed(1)}M`;
  } else if (localAmount >= 1000) {
    return `${(localAmount / 1000).toFixed(0)}K`;
  }
  return localAmount.toFixed(0);
}

export function calculateMonthlyTotal(city: CityData): number {
  return city.housing + city.food + city.internet + city.transport + (city.cafe * 20);
}

export function getCategoryValue(city: CityData, category: CostCategory): number {
  switch (category) {
    case 'housing':
      return city.housing;
    case 'food':
      return city.food;
    case 'cafe':
      return city.cafe;
    case 'internet':
      return city.internet;
    case 'transport':
      return city.transport;
    default:
      return 0;
  }
}

export function getCategoryLabel(category: CostCategory): string {
  const labels: Record<CostCategory, string> = {
    housing: 'Housing',
    food: 'Food',
    cafe: 'Café',
    internet: 'Internet',
    transport: 'Transport',
  };
  return labels[category];
}

export function getCategoryIcon(category: CostCategory): string {
  const icons: Record<CostCategory, string> = {
    housing: '🏠',
    food: '🍜',
    cafe: '☕',
    internet: '🌐',
    transport: '🚕',
  };
  return icons[category];
}
