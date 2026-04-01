'use client';

import { motion } from 'framer-motion';
import { CitySize, Country, CostCategory } from '@/types';
import { getMonthlyTotal, formatLocalPrice } from '@/data/countries';
import AnimatedNumber from './AnimatedNumber';

interface CountryCardProps {
  country: Country;
  citySize: CitySize;
  activeCategory: CostCategory | null;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  index: number;
}

const categoryIcons: Record<string, string> = {
  housing: '🏠',
  food: '🍜',
  cafe: '☕',
  internet: '🌐',
  transport: '🚕',
};

export default function CountryCard({
  country,
  citySize,
  activeCategory,
  isPinned,
  onTogglePin,
  index,
}: CountryCardProps) {
  const city = country.cities[citySize];
  const total = getMonthlyTotal(country, citySize);

  const categories: { key: CostCategory; value: number; label: string }[] = [
    { key: 'housing', value: city.housing, label: 'Housing' },
    { key: 'food', value: city.food, label: 'Food' },
    { key: 'cafe', value: city.cafe, label: 'Café' },
    { key: 'internet', value: city.internet, label: 'Internet' },
    { key: 'transport', value: city.transport, label: 'Transport' },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        layout: { type: 'spring', stiffness: 300, damping: 30 },
      }}
      className={`relative group rounded-2xl overflow-hidden transition-shadow duration-300 ${
        isPinned
          ? 'bg-warm-white shadow-lg shadow-terracotta/10 ring-2 ring-terracotta/30'
          : 'bg-warm-white shadow-md hover:shadow-xl hover:shadow-charcoal/5'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{country.flag}</span>
              <h3 className="font-display text-xl font-bold text-charcoal">
                {country.name}
              </h3>
            </div>
            <p className="text-xs text-warm-gray font-body">
              {country.currencyCode} · 1 USD ≈ {country.usdRate.toLocaleString()} {country.currencyCode}
            </p>
          </div>

          <button
            onClick={() => onTogglePin(country.id)}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer ${
              isPinned
                ? 'bg-terracotta text-warm-white'
                : 'bg-sand-light/50 text-warm-gray hover:bg-terracotta/10 hover:text-terracotta'
            }`}
            title={isPinned ? 'Unpin' : 'Pin to compare'}
          >
            <svg
              className="w-4 h-4"
              fill={isPinned ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1 mb-4 bg-sand-light/40 rounded-xl p-1">
          {(['large', 'mid', 'small'] as const).map((size) => {
            const labels: Record<CitySize, string> = {
              large: 'City',
              mid: 'Mid',
              small: 'Town',
            };
            const isActive = citySize === size;
            return (
              <button
                key={size}
                className={`relative flex-1 px-2 py-1.5 rounded-lg text-xs font-body font-medium transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-charcoal' : 'text-warm-gray hover:text-charcoal-light'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId={`city-${country.id}`}
                    className="absolute inset-0 bg-warm-white rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{labels[size]}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-teal font-body font-medium mb-3">
          📍 {city.name}
        </p>

        <div className="space-y-2.5">
          {categories.map((cat) => {
            const isHighlighted = activeCategory === cat.key;
            return (
              <motion.div
                key={cat.key}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors duration-200 ${
                  isHighlighted
                    ? 'bg-terracotta/[0.08] border border-terracotta/20'
                    : 'bg-sand-light/20'
                }`}
                animate={{
                  scale: isHighlighted ? 1.02 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <span className="text-xs font-body text-charcoal-light flex items-center gap-1.5">
                  <span>{categoryIcons[cat.key]}</span>
                  {cat.label}
                </span>
                <div className="text-right">
                  <AnimatedNumber
                    value={cat.value}
                    prefix="$"
                    decimals={cat.key === 'cafe' ? 2 : 0}
                    className={`text-sm font-body font-semibold ${
                      isHighlighted ? 'text-terracotta' : 'text-charcoal'
                    }`}
                  />
                  <span className="text-[10px] text-warm-gray ml-1">
                    {formatLocalPrice(cat.value, country.usdRate)} {country.currencyCode}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-sand/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-body text-warm-gray uppercase tracking-wider">
              Monthly
            </span>
            <AnimatedNumber
              value={total}
              prefix="$"
              suffix="/mo"
              className="text-lg font-display font-bold text-teal"
            />
          </div>
        </div>
      </div>

      {isPinned && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-terracotta via-gold to-terracotta"
          layoutId={`pin-bar-${country.id}`}
        />
      )}
    </motion.div>
  );
}
