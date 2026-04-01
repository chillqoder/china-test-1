export type CitySize = "large" | "mid" | "small";

export type CostCategory =
  | "housing"
  | "food"
  | "cafe"
  | "internet"
  | "transport";

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
  housing: "Housing",
  food: "Food",
  cafe: "Cafe",
  internet: "Internet",
  transport: "Transport",
};

export const categoryIcons: Record<CostCategory, string> = {
  housing: "🏠",
  food: "🍜",
  cafe: "☕",
  internet: "🌐",
  transport: "🚕",
};

export function getTotalMonthly(data: CityData): number {
  return data.housing + data.food + data.cafe * 30 + data.internet + data.transport;
}

export const countries: Country[] = [
  {
    id: "thailand",
    name: "Thailand",
    flag: "🇹🇭",
    currency: "Thai Baht",
    currencyCode: "THB",
    usdRate: 34,
    cities: {
      large: {
        name: "Bangkok",
        housing: 550,
        food: 280,
        cafe: 3.5,
        internet: 20,
        transport: 80,
      },
      mid: {
        name: "Chiang Mai",
        housing: 320,
        food: 200,
        cafe: 2.5,
        internet: 18,
        transport: 50,
      },
      small: {
        name: "Pai",
        housing: 200,
        food: 160,
        cafe: 2,
        internet: 15,
        transport: 30,
      },
    },
  },
  {
    id: "vietnam",
    name: "Vietnam",
    flag: "🇻🇳",
    currency: "Vietnamese Dong",
    currencyCode: "VND",
    usdRate: 24500,
    cities: {
      large: {
        name: "Ho Chi Minh City",
        housing: 450,
        food: 220,
        cafe: 2,
        internet: 12,
        transport: 60,
      },
      mid: {
        name: "Da Nang",
        housing: 320,
        food: 180,
        cafe: 1.8,
        internet: 10,
        transport: 40,
      },
      small: {
        name: "Hoi An",
        housing: 250,
        food: 150,
        cafe: 1.5,
        internet: 10,
        transport: 25,
      },
    },
  },
  {
    id: "indonesia",
    name: "Indonesia",
    flag: "🇮🇩",
    currency: "Indonesian Rupiah",
    currencyCode: "IDR",
    usdRate: 15700,
    cities: {
      large: {
        name: "Jakarta",
        housing: 480,
        food: 240,
        cafe: 3,
        internet: 25,
        transport: 70,
      },
      mid: {
        name: "Ubud",
        housing: 380,
        food: 200,
        cafe: 3,
        internet: 22,
        transport: 45,
      },
      small: {
        name: "Munduk",
        housing: 220,
        food: 140,
        cafe: 2,
        internet: 18,
        transport: 25,
      },
    },
  },
  {
    id: "malaysia",
    name: "Malaysia",
    flag: "🇲🇾",
    currency: "Malaysian Ringgit",
    currencyCode: "MYR",
    usdRate: 4.5,
    cities: {
      large: {
        name: "Kuala Lumpur",
        housing: 420,
        food: 230,
        cafe: 3.5,
        internet: 22,
        transport: 55,
      },
      mid: {
        name: "Penang",
        housing: 300,
        food: 190,
        cafe: 2.8,
        internet: 20,
        transport: 40,
      },
      small: {
        name: "Ipoh",
        housing: 200,
        food: 150,
        cafe: 2.2,
        internet: 18,
        transport: 30,
      },
    },
  },
  {
    id: "philippines",
    name: "Philippines",
    flag: "🇵🇭",
    currency: "Philippine Peso",
    currencyCode: "PHP",
    usdRate: 56,
    cities: {
      large: {
        name: "Manila",
        housing: 400,
        food: 220,
        cafe: 3,
        internet: 28,
        transport: 60,
      },
      mid: {
        name: "Cebu",
        housing: 280,
        food: 180,
        cafe: 2.5,
        internet: 25,
        transport: 45,
      },
      small: {
        name: "Siargao",
        housing: 220,
        food: 160,
        cafe: 2.5,
        internet: 22,
        transport: 30,
      },
    },
  },
  {
    id: "cambodia",
    name: "Cambodia",
    flag: "🇰🇭",
    currency: "Cambodian Riel",
    currencyCode: "KHR",
    usdRate: 4100,
    cities: {
      large: {
        name: "Phnom Penh",
        housing: 350,
        food: 180,
        cafe: 2.5,
        internet: 20,
        transport: 50,
      },
      mid: {
        name: "Siem Reap",
        housing: 280,
        food: 160,
        cafe: 2,
        internet: 18,
        transport: 35,
      },
      small: {
        name: "Kampot",
        housing: 180,
        food: 130,
        cafe: 1.5,
        internet: 15,
        transport: 25,
      },
    },
  },
  {
    id: "laos",
    name: "Laos",
    flag: "🇱🇦",
    currency: "Lao Kip",
    currencyCode: "LAK",
    usdRate: 21000,
    cities: {
      large: {
        name: "Vientiane",
        housing: 300,
        food: 160,
        cafe: 2,
        internet: 18,
        transport: 40,
      },
      mid: {
        name: "Luang Prabang",
        housing: 250,
        food: 140,
        cafe: 1.8,
        internet: 15,
        transport: 30,
      },
      small: {
        name: "Vang Vieng",
        housing: 180,
        food: 120,
        cafe: 1.5,
        internet: 12,
        transport: 20,
      },
    },
  },
  {
    id: "myanmar",
    name: "Myanmar",
    flag: "🇲🇲",
    currency: "Myanmar Kyat",
    currencyCode: "MMK",
    usdRate: 2100,
    cities: {
      large: {
        name: "Yangon",
        housing: 280,
        food: 150,
        cafe: 1.5,
        internet: 22,
        transport: 35,
      },
      mid: {
        name: "Mandalay",
        housing: 200,
        food: 120,
        cafe: 1.2,
        internet: 18,
        transport: 25,
      },
      small: {
        name: "Hpa-An",
        housing: 140,
        food: 100,
        cafe: 1,
        internet: 15,
        transport: 18,
      },
    },
  },
];
