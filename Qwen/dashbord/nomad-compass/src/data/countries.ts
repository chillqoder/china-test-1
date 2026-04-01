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

export const categoryLabels: Record<CostCategory, string> = {
  housing: 'Housing',
  food: 'Food',
  cafe: 'Café',
  internet: 'Internet',
  transport: 'Transport',
};

export const categoryIcons: Record<CostCategory, string> = {
  housing: '🏠',
  food: '🍜',
  cafe: '☕',
  internet: '🌐',
  transport: '🚕',
};

export const formatLocalCurrency = (usdAmount: number, rate: number, code: string): string => {
  const localAmount = Math.round(usdAmount * rate);
  return `${localAmount.toLocaleString()} ${code}`;
};

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
        housing: 650,
        food: 200,
        cafe: 3.5,
        internet: 20,
        transport: 60,
      },
      mid: {
        name: 'Chiang Mai',
        housing: 350,
        food: 160,
        cafe: 2.5,
        internet: 18,
        transport: 40,
      },
      small: {
        name: 'Pai',
        housing: 220,
        food: 140,
        cafe: 2,
        internet: 22,
        transport: 25,
      },
    },
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '🇻🇳',
    currency: 'Vietnamese Dong',
    currencyCode: 'VND',
    usdRate: 25400,
    cities: {
      large: {
        name: 'Ho Chi Minh City',
        housing: 500,
        food: 170,
        cafe: 2,
        internet: 12,
        transport: 45,
      },
      mid: {
        name: 'Da Nang',
        housing: 350,
        food: 150,
        cafe: 1.5,
        internet: 11,
        transport: 35,
      },
      small: {
        name: 'Hoi An',
        housing: 280,
        food: 140,
        cafe: 1.5,
        internet: 12,
        transport: 20,
      },
    },
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    flag: '🇮🇩',
    currency: 'Indonesian Rupiah',
    currencyCode: 'IDR',
    usdRate: 15800,
    cities: {
      large: {
        name: 'Jakarta',
        housing: 550,
        food: 180,
        cafe: 3,
        internet: 25,
        transport: 50,
      },
      mid: {
        name: 'Ubud',
        housing: 400,
        food: 160,
        cafe: 2.5,
        internet: 28,
        transport: 35,
      },
      small: {
        name: 'Lovina',
        housing: 250,
        food: 130,
        cafe: 2,
        internet: 30,
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
        housing: 500,
        food: 180,
        cafe: 3,
        internet: 22,
        transport: 40,
      },
      mid: {
        name: 'George Town',
        housing: 350,
        food: 160,
        cafe: 2.5,
        internet: 20,
        transport: 30,
      },
      small: {
        name: 'Ipoh',
        housing: 220,
        food: 130,
        cafe: 2,
        internet: 18,
        transport: 20,
      },
    },
  },
  {
    id: 'philippines',
    name: 'Philippines',
    flag: '🇵🇭',
    currency: 'Philippine Peso',
    currencyCode: 'PHP',
    usdRate: 56.5,
    cities: {
      large: {
        name: 'Manila',
        housing: 450,
        food: 170,
        cafe: 3,
        internet: 30,
        transport: 45,
      },
      mid: {
        name: 'Cebu',
        housing: 320,
        food: 150,
        cafe: 2.5,
        internet: 28,
        transport: 35,
      },
      small: {
        name: 'Dumaguete',
        housing: 200,
        food: 130,
        cafe: 2,
        internet: 32,
        transport: 20,
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
        housing: 400,
        food: 160,
        cafe: 2.5,
        internet: 25,
        transport: 40,
      },
      mid: {
        name: 'Siem Reap',
        housing: 280,
        food: 140,
        cafe: 2,
        internet: 22,
        transport: 25,
      },
      small: {
        name: 'Battambang',
        housing: 180,
        food: 120,
        cafe: 1.5,
        internet: 20,
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
        housing: 350,
        food: 140,
        cafe: 2,
        internet: 30,
        transport: 30,
      },
      mid: {
        name: 'Luang Prabang',
        housing: 250,
        food: 130,
        cafe: 2,
        internet: 35,
        transport: 20,
      },
      small: {
        name: 'Pakse',
        housing: 160,
        food: 110,
        cafe: 1.5,
        internet: 32,
        transport: 15,
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
        food: 130,
        cafe: 1.5,
        internet: 35,
        transport: 30,
      },
      mid: {
        name: 'Mandalay',
        housing: 220,
        food: 110,
        cafe: 1,
        internet: 32,
        transport: 20,
      },
      small: {
        name: 'Bagan',
        housing: 150,
        food: 100,
        cafe: 1,
        internet: 38,
        transport: 15,
      },
    },
  },
];
