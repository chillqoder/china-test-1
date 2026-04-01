'use client';

import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Country, CostCategory, CitySize } from '@/types';
import { formatCurrency, getCategoryValue, calculateMonthlyTotal, getCategoryLabel } from '@/lib/utils';

interface ComparisonPanelProps {
  countries: Country[];
  activeCategory: CostCategory | 'all';
  selectedCitySize: CitySize;
  onRemove: (countryId: string) => void;
}

export default function ComparisonPanel({ 
  countries, 
  activeCategory,
  selectedCitySize,
  onRemove 
}: ComparisonPanelProps) {
  const getValue = (country: Country) => {
    if (activeCategory === 'all') {
      return calculateMonthlyTotal(country.cities[selectedCitySize]);
    }
    return getCategoryValue(country.cities[selectedCitySize], activeCategory);
  };

  const values = countries.map(getValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="bg-gradient-to-r from-nomad-indigo/50 via-slate-900/80 to-nomad-indigo/50 border-b border-slate-700/50 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              Comparison
              <span className="text-sm font-normal text-slate-400">
                ({activeCategory === 'all' ? 'Monthly Total' : getCategoryLabel(activeCategory)})
              </span>
            </h3>
            <p className="text-sm text-slate-500">
              Comparing {countries.length} countries at {selectedCitySize === 'large' ? 'Large City' : selectedCitySize === 'mid' ? 'Mid-size City' : 'Small Town'} level
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {countries.map((country, index) => {
            const value = getValue(country);
            const isCheapest = value === minValue && countries.length > 1;
            const isMostExpensive = value === maxValue && countries.length > 1;
            const city = country.cities[selectedCitySize];

            return (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              >
                <button
                  onClick={() => onRemove(country.id)}
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <h4 className="font-medium text-white">{country.name}</h4>
                    <p className="text-xs text-slate-400">{city.name}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      ${value.toLocaleString()}
                      {activeCategory === 'cafe' ? '/visit' : activeCategory !== 'all' ? '/mo' : '/mo'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {country.currencyCode}
                    </p>
                  </div>

                  {isCheapest && (
                    <div className="flex items-center gap-1 text-emerald-400 text-sm">
                      <TrendingDown className="w-4 h-4" />
                      <span>Lowest</span>
                    </div>
                  )}
                  {isMostExpensive && (
                    <div className="flex items-center gap-1 text-nomad-coral text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>Highest</span>
                    </div>
                  )}
                </div>

                {/* Savings indicator */}
                {!isCheapest && countries.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400">
                      <span className="text-emerald-400 font-medium">
                        ${(value - minValue).toLocaleString()}
                      </span>
                      {' '}more than cheapest
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Summary stats */}
        {countries.length > 1 && (
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Range:</span>
              <span className="text-white font-medium">
                ${(maxValue - minValue).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Average:</span>
              <span className="text-white font-medium">
                ${Math.round(values.reduce((a, b) => a + b, 0) / values.length).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
