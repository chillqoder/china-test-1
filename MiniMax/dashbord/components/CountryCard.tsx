'use client';

import { motion } from 'framer-motion';
import { CitySize, CostCategory, Country } from '@/types';
import { cn, formatLocalCurrency } from '@/lib/utils';
import CitySelector from './CitySelector';

interface CountryCardProps {
  country: Country;
  citySize: CitySize;
  onCitySizeChange: (size: CitySize) => void;
  isPinned: boolean;
  isPinnedIndex: number;
  onTogglePin: () => void;
  activeCategory: CostCategory | 'all';
  categoryValues: { id: string; value: number }[];
}

const categoryLabels: Record<CostCategory, string> = {
  housing: 'Housing',
  food: 'Food',
  cafe: 'Cafe',
  internet: 'Internet',
  transport: 'Transport',
};

const categoryColors: Record<CostCategory, string> = {
  housing: 'text-blue-600',
  food: 'text-green-600',
  cafe: 'text-amber-600',
  internet: 'text-purple-600',
  transport: 'text-pink-600',
};

export default function CountryCard({
  country,
  citySize,
  onCitySizeChange,
  isPinned,
  isPinnedIndex,
  onTogglePin,
  activeCategory,
  categoryValues,
}: CountryCardProps) {
  const cityData = country.cities[citySize];
  const monthlyTotal = cityData.housing + cityData.food + cityData.transport;
  const categoryValue = activeCategory !== 'all' 
    ? cityData[activeCategory]
    : null;

  const rank = activeCategory !== 'all'
    ? [...categoryValues].sort((a, b) => a.value - b.value).findIndex(v => v.id === country.id) + 1
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={cn(
        'relative bg-white rounded-2xl p-5 shadow-sm border border-sand-200/50 transition-shadow hover:shadow-md',
        isPinned && 'ring-2 ring-terracotta-500 ring-offset-2'
      )}
    >
      {isPinned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-terracotta-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md z-10">
          {isPinnedIndex + 1}
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{country.flag}</span>
            <h3 className="font-serif text-xl text-ink-950">{country.name}</h3>
          </div>
          <p className="text-xs text-ink-400 mt-0.5">
            {country.currencyCode} • 1 USD = {country.usdRate.toLocaleString()}
          </p>
        </div>
        <button
          onClick={onTogglePin}
          className={cn(
            'p-2 rounded-full transition-colors',
            isPinned 
              ? 'bg-terracotta-500 text-white' 
              : 'bg-sand-100 text-ink-400 hover:bg-sand-200 hover:text-ink-600'
          )}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      </div>

      <CitySelector value={citySize} onChange={onCitySizeChange} cityName={cityData.name} />

      <div className="mt-4 space-y-3">
        {Object.entries(cityData).filter(([key]) => key !== 'name').map(([key, value]) => {
          const category = key as CostCategory;
          const isActive = activeCategory === category;
          const displayValue = key === 'cafe' ? `$${value}/visit` : `$${value}/mo`;
          
          return (
            <motion.div
              key={key}
              layout
              className={cn(
                'flex items-center justify-between py-2 px-3 rounded-lg transition-colors',
                isActive ? 'bg-terracotta-50' : 'bg-sand-50'
              )}
            >
              <span className={cn(
                'text-sm font-medium',
                isActive ? 'text-terracotta-700' : 'text-ink-600'
              )}>
                {categoryLabels[category]}
              </span>
              <motion.span
                key={`${citySize}-${key}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'font-semibold tabular-nums',
                  isActive ? 'text-terracotta-600' : 'text-ink-900',
                  activeCategory !== 'all' && categoryValue && value < categoryValue ? 'text-green-600' : ''
                )}
              >
                {displayValue}
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-sand-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-500">Est. monthly total</span>
          <motion.span
            key={`total-${citySize}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-serif text-2xl text-ink-950"
          >
            ${monthlyTotal}
            <span className="text-sm text-ink-400 font-sans">/mo</span>
          </motion.span>
        </div>
        <p className="text-xs text-ink-400 mt-1">
          {formatLocalCurrency(monthlyTotal, country.currencyCode)}
        </p>
      </div>

      {rank && activeCategory !== 'all' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-12 bg-amber-400 text-ink-950 text-xs font-bold px-2 py-1 rounded-full"
        >
          #{rank}
        </motion.div>
      )}
    </motion.div>
  );
}
