'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Country, CitySize, CostCategory } from '@/types';
import AnimatedNumber from './AnimatedNumber';

interface ComparisonPanelProps {
  pinnedCountries: Country[];
  citySize: CitySize;
  activeCategory: CostCategory | null;
  onUnpin: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  housing: 'Housing',
  food: 'Food',
  cafe: 'Café',
  internet: 'Internet',
  transport: 'Transport',
};

const categoryIcons: Record<string, string> = {
  housing: '🏠',
  food: '🍜',
  cafe: '☕',
  internet: '🌐',
  transport: '🚕',
};

export default function ComparisonPanel({
  pinnedCountries,
  citySize,
  activeCategory,
  onUnpin,
}: ComparisonPanelProps) {
  if (pinnedCountries.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 20, height: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-warm-white rounded-2xl shadow-lg border border-sand/50 overflow-hidden"
      >
        <div className="px-5 py-3 bg-gradient-to-r from-terracotta/5 to-gold/5 border-b border-sand/30">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-charcoal flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              Comparing {pinnedCountries.length} destinations
              {activeCategory && (
                <span className="text-warm-gray font-body font-normal">
                  · {categoryIcons[activeCategory]} {categoryLabels[activeCategory]}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="p-5">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${pinnedCountries.length}, 1fr)`,
            }}
          >
            {pinnedCountries.map((country) => {
              const city = country.cities[citySize];
              const categories = activeCategory
                ? [
                    {
                      key: activeCategory,
                      value: city[activeCategory],
                    },
                  ]
                : [
                    { key: 'housing', value: city.housing },
                    { key: 'food', value: city.food },
                    { key: 'cafe', value: city.cafe },
                    { key: 'internet', value: city.internet },
                    { key: 'transport', value: city.transport },
                  ];

              const total =
                city.housing + city.food + city.internet + city.transport;

              return (
                <motion.div
                  key={country.id}
                  layout
                  className="bg-sand-light/20 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{country.flag}</span>
                      <span className="font-display font-bold text-charcoal text-sm">
                        {country.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onUnpin(country.id)}
                      className="w-6 h-6 rounded-full bg-sand/30 flex items-center justify-center text-warm-gray hover:bg-terracotta hover:text-warm-white transition-colors cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-[10px] text-teal font-body mb-2">
                    {city.name}
                  </p>

                  <div className="space-y-1.5">
                    {categories.map((cat) => (
                      <div
                        key={cat.key}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-warm-gray">
                          {categoryIcons[cat.key]} {categoryLabels[cat.key]}
                        </span>
                        <AnimatedNumber
                          value={cat.value}
                          prefix="$"
                          decimals={cat.key === 'cafe' ? 2 : 0}
                          className="font-semibold text-charcoal"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-sand/30 flex items-center justify-between">
                    <span className="text-[10px] text-warm-gray uppercase tracking-wider">
                      Total
                    </span>
                    <AnimatedNumber
                      value={total}
                      prefix="$"
                      suffix="/mo"
                      className="font-display font-bold text-teal text-sm"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
