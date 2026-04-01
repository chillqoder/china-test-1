export type CitySize = 'large' | 'mid' | 'small';

export type CostCategory = 'housing' | 'food' | 'cafe' | 'internet' | 'transport';

export interface CityData {
  name: string;
  housing: number;
  food: number;
  cafe: number;
  internet: number;
  transport: number;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  currency: string;
  currencyCode: string;
  usdRate: number;
  cities: {
    large: CityData;
    mid: CityData;
    small: CityData;
  };
}

export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  category: CostCategory | 'all';
  sortDirection: SortDirection;
}
