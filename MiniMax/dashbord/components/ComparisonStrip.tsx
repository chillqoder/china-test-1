'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Country, CitySize, CostCategory } from '@/types';
import { cn } from '@/lib/utils';

interface ComparisonStripProps {
  countries: Country[];
  citySize: CitySize;
  activeCategory: CostCategory | 'all';
  onRemove: (id: string) => void;
}

export default function ComparisonStrip({
  countries,
  citySize,
  activeCategory,
  onRemove,
}: ComparisonStripProps) {
  if (countries.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-ink-950 text-white py-4 px-6 shadow-2xl z-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-medium">
              Comparing {countries.length} {countries.length === 1 ? 'destination' : 'destinations'}
            </span>
            {countries.length > 1 && activeCategory !== 'all' && (
              <span className="text-xs text-sand-400">
                Sorted by {activeCategory}
              </span>
            )}
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            {countries.map((country, index) => {
              const cityData = country.cities[citySize];
              const categoryValue = activeCategory !== 'all'
                ? cityData[activeCategory]
                : cityData.housing + cityData.food + cityData.transport;
              
              return (
                <motion.div
                  key={country.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex-shrink-0 bg-white/10 backdrop-blur rounded-xl p-4 min-w-[180px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="font-medium text-white">{country.name}</span>
                    </div>
                    <button
                      onClick={() => onRemove(country.id)}
                      className="text-sand-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-2xl font-serif text-amber-400">
                    ${categoryValue}
                    <span className="text-sm text-sand-400 font-sans">
                      {activeCategory !== 'all' ? '' : '/mo'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-sand-400 mt-1">
                    {cityData.name} • {citySize === 'large' ? 'Large' : citySize === 'mid' ? 'Mid-size' : 'Small'} city
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
