'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Country, CostCategory, CitySize } from '@/types';
import { categoryLabels, categoryIcons, formatLocalCurrency } from '@/data/countries';
import { Pin, PinOff, ChevronDown } from 'lucide-react';

interface CountryCardProps {
  country: Country;
  activeCategory: CostCategory | 'all';
  isPinned: boolean;
  canPin: boolean;
  onTogglePin: () => void;
}

const citySizeLabels: Record<CitySize, string> = {
  large: 'Large',
  mid: 'Mid',
  small: 'Small',
};

const categories: CostCategory[] = ['housing', 'food', 'cafe', 'internet', 'transport'];

export function CountryCard({
  country,
  activeCategory,
  isPinned,
  canPin,
  onTogglePin,
}: CountryCardProps) {
  const [selectedCity, setSelectedCity] = useState<CitySize>('mid');
  const city = country.cities[selectedCity];

  const totalMonthly = city.housing + city.food + city.internet + city.transport + city.cafe * 20;

  return (
    <motion.div
      layout
      className={`
        relative rounded-2xl border transition-all duration-300 overflow-hidden
        ${
          isPinned
            ? 'border-accent/40 bg-gradient-to-br from-surface to-accent/5 shadow-lg shadow-accent/10'
            : 'border-border bg-surface hover:border-border-hover hover:bg-surface-hover'
        }
      `}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Pinned indicator */}
      {isPinned && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-coral" />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{country.flag}</span>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {country.name}
              </h3>
            </div>
            <p className="text-xs text-foreground/40">
              {country.currency} · 1 USD = {country.usdRate.toLocaleString()} {country.currencyCode}
            </p>
          </div>

          {/* Pin button */}
          <button
            onClick={onTogglePin}
            className={`
              p-2 rounded-lg transition-colors
              ${
                isPinned
                  ? 'text-accent bg-accent/10'
                  : 'text-foreground/30 hover:text-foreground/60 hover:bg-surface-hover'
              }
            `}
          >
            {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>
        </div>

        {/* City selector */}
        <div className="flex gap-1 mb-4 p-1 rounded-lg bg-black/20">
          {(['large', 'mid', 'small'] as CitySize[]).map((size) => (
            <button
              key={size}
              onClick={() => setSelectedCity(size)}
              className={`
                flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200
                ${
                  selectedCity === size
                    ? 'bg-primary/20 text-primary-light shadow-sm'
                    : 'text-foreground/40 hover:text-foreground/60'
                }
              `}
            >
              {citySizeLabels[size]}
              <span className="block text-[10px] opacity-60 truncate">
                {country.cities[size].name}
              </span>
            </button>
          ))}
        </div>

        {/* Cost categories */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {categories.map((category) => {
              const value = city[category];
              const isHighlighted = activeCategory === category;
              const localCurrency = formatLocalCurrency(value, country.usdRate, country.currencyCode);

              return (
                <motion.div
                  key={category}
                  layout
                  className={`
                    flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200
                    ${isHighlighted ? 'bg-primary/10 border border-primary/20' : ''}
                  `}
                  animate={{
                    scale: isHighlighted ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[category]}</span>
                    <span className={`text-sm ${isHighlighted ? 'text-primary-light font-medium' : 'text-foreground/60'}`}>
                      {categoryLabels[category]}
                    </span>
                  </div>
                  <div className="text-right">
                    <motion.span
                      key={`${selectedCity}-${category}`}
                      className={`block text-lg font-semibold tabular-nums ${
                        isHighlighted ? 'text-accent' : 'text-foreground'
                      }`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ${value}
                    </motion.span>
                    <span className="text-[10px] text-foreground/30">{localCurrency}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Total estimate */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground/40 uppercase tracking-wider">
              Est. monthly total
            </span>
            <motion.span
              key={`${selectedCity}-total`}
              className="text-lg font-bold text-foreground tabular-nums"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              ${totalMonthly.toLocaleString()}
            </motion.span>
          </div>
          <p className="text-[10px] text-foreground/30 mt-1 text-right">
            {formatLocalCurrency(totalMonthly, country.usdRate, country.currencyCode)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
