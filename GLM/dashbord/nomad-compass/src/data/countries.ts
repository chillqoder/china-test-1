import { Country } from '@/types';

export const countries: Country[] = [
  {
    id: 'thailand',
    name: 'Thailand',
    flag: '🇹🇭',
    currency: 'Thai Baht',
    currencyCode: 'THB',
    usdRate: 35.5,
    cities: {
      large: {
        name: 'Bangkok',
        housing: 520,
        food: 260,
        cafe: 4.5,
        internet: 25,
        transport: 45,
      },
      mid: {
        name: 'Chiang Mai',
        housing: 350,
        food: 200,
        cafe: 3.2,
        internet: 22,
        transport: 30,
      },
      small: {
        name: 'Pai',
        housing: 190,
        food: 140,
        cafe: 2.5,
        internet: 15,
        transport: 18,
      },
    },
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '🇻🇳',
    currency: 'Vietnamese Dong',
    currencyCode: 'VND',
    usdRate: 24500,
    cities: {
      large: {
        name: 'Ho Chi Minh City',
        housing: 460,
        food: 220,
        cafe: 3.0,
        internet: 15,
        transport: 35,
      },
      mid: {
        name: 'Da Nang',
        housing: 300,
        food: 175,
        cafe: 2.5,
        internet: 12,
        transport: 25,
      },
      small: {
        name: 'Hoi An',
        housing: 220,
        food: 145,
        cafe: 2.0,
        internet: 10,
        transport: 18,
      },
    },
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    flag: '🇮🇩',
    currency: 'Indonesian Rupiah',
    currencyCode: 'IDR',
    usdRate: 15700,
    cities: {
      large: {
        name: 'Jakarta',
        housing: 450,
        food: 240,
        cafe: 3.8,
        internet: 28,
        transport: 38,
      },
      mid: {
        name: 'Ubud',
        housing: 420,
        food: 230,
        cafe: 4.0,
        internet: 24,
        transport: 25,
      },
      small: {
        name: 'Senggigi',
        housing: 260,
        food: 165,
        cafe: 2.5,
        internet: 18,
        transport: 20,
      },
    },
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    flag: '🇲🇾',
    currency: 'Malaysian Ringgit',
    currencyCode: 'MYR',
    usdRate: 4.7,
    cities: {
      large: {
        name: 'Kuala Lumpur',
        housing: 530,
        food: 260,
        cafe: 4.2,
        internet: 32,
        transport: 42,
      },
      mid: {
        name: 'Penang',
        housing: 360,
        food: 200,
        cafe: 3.0,
        internet: 25,
        transport: 26,
      },
      small: {
        name: 'Kota Kinabalu',
        housing: 280,
        food: 175,
        cafe: 2.8,
        internet: 22,
        transport: 22,
      },
    },
  },
  {
    id: 'philippines',
    name: 'Philippines',
    flag: '🇵🇭',
    currency: 'Philippine Peso',
    currencyCode: 'PHP',
    usdRate: 56,
    cities: {
      large: {
        name: 'Manila',
        housing: 490,
        food: 245,
        cafe: 4.2,
        internet: 32,
        transport: 38,
      },
      mid: {
        name: 'Cebu City',
        housing: 350,
        food: 195,
        cafe: 3.0,
        internet: 26,
        transport: 25,
      },
      small: {
        name: 'Siargao',
        housing: 260,
        food: 160,
        cafe: 2.8,
        internet: 20,
        transport: 18,
      },
    },
  },
  {
    id: 'cambodia',
    name: 'Cambodia',
    flag: '🇰🇭',
    currency: 'Cambodian Riel',
    currencyCode: 'KHR',
    usdRate: 4100,
    cities: {
      large: {
        name: 'Phnom Penh',
        housing: 360,
        food: 200,
        cafe: 3.2,
        internet: 22,
        transport: 28,
      },
      mid: {
        name: 'Siem Reap',
        housing: 280,
        food: 170,
        cafe: 2.5,
        internet: 18,
        transport: 20,
      },
      small: {
        name: 'Kampot',
        housing: 180,
        food: 125,
        cafe: 1.8,
        internet: 12,
        transport: 15,
      },
    },
  },
  {
    id: 'laos',
    name: 'Laos',
    flag: '🇱🇦',
    currency: 'Lao Kip',
    currencyCode: 'LAK',
    usdRate: 21500,
    cities: {
      large: {
        name: 'Vientiane',
        housing: 340,
        food: 185,
        cafe: 2.8,
        internet: 22,
        transport: 24,
      },
      mid: {
        name: 'Luang Prabang',
        housing: 270,
        food: 155,
        cafe: 2.5,
        internet: 16,
        transport: 18,
      },
      small: {
        name: 'Vang Vieng',
        housing: 175,
        food: 125,
        cafe: 1.8,
        internet: 10,
        transport: 12,
      },
    },
  },
  {
    id: 'myanmar',
    name: 'Myanmar',
    flag: '🇲🇲',
    currency: 'Myanmar Kyat',
    currencyCode: 'MMK',
    usdRate: 2100,
    cities: {
      large: {
        name: 'Yangon',
        housing: 350,
        food: 180,
        cafe: 2.8,
        internet: 22,
        transport: 22,
      },
      mid: {
        name: 'Mandalay',
        housing: 240,
        food: 145,
        cafe: 2.0,
        internet: 15,
        transport: 15,
      },
      small: {
        name: 'Hsipaw',
        housing: 140,
        food: 105,
        cafe: 1.5,
        internet: 10,
        transport: 10,
      },
    },
  },
];

export const categoryLabels: Record<string, string> = {
  housing: '🏠 Housing',
  food: '🍜 Food',
  cafe: '☕ Café',
  internet: '🌐 Internet',
  transport: '🚕 Transport',
};

export const categoryKeys = ['housing', 'food', 'cafe', 'internet', 'transport'] as const;

export const citySizeLabels: Record<string, string> = {
  large: 'Large City',
  mid: 'Mid-Size',
  small: 'Small Town',
};

export function getMonthlyTotal(
  country: Country,
  citySize: 'large' | 'mid' | 'small'
): number {
  const city = country.cities[citySize];
  return city.housing + city.food + city.internet + city.transport;
}

export function formatLocalPrice(usd: number, rate: number): string {
  const local = usd * rate;
  if (rate >= 1000) {
    return `~${Math.round(local / 1000)}k`;
  }
  return `~${local.toFixed(0)}`;
}
