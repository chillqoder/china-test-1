'use client';

import { motion } from 'framer-motion';
import type { Country, CostCategory } from '@/types';
import { categoryLabels, categoryIcons, formatLocalCurrency } from '@/data/countries';
import { X } from 'lucide-react';

interface ComparisonPanelProps {
  pinnedCountries: Country[];
  activeCategory: CostCategory | 'all';
  onUnpin: (id: string) => void;
}

export function ComparisonPanel({
  pinnedCountries,
  activeCategory,
  onUnpin,
}: ComparisonPanelProps) {
  const categories: CostCategory[] = ['housing', 'food', 'cafe', 'internet', 'transport'];
  const displayCategories = activeCategory === 'all' ? categories : [activeCategory as CostCategory];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-accent/20 bg-gradient-to-r from-surface via-accent/5 to-surface p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-sm font-semibold text-accent uppercase tracking-wider">
          Comparison
        </h3>
        <span className="text-xs text-foreground/40">
          {pinnedCountries.length}/3 pinned
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pinnedCountries.map((country) => (
          <div
            key={country.id}
            className="relative rounded-xl bg-black/20 border border-border p-4"
          >
            <button
              onClick={() => onUnpin(country.id)}
              className="absolute top-2 right-2 p-1 rounded-md text-foreground/30 hover:text-foreground/60 hover:bg-surface-hover transition-colors"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{country.flag}</span>
              <span className="font-heading text-sm font-semibold text-foreground">
                {country.name}
              </span>
            </div>

            <div className="space-y-2">
              {displayCategories.map((cat) => {
                const value = country.cities.mid[cat];
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-xs text-foreground/50 flex items-center gap-1">
                      {categoryIcons[cat]} {categoryLabels[cat]}
                    </span>
                    <span className="text-sm font-semibold text-accent tabular-nums">
                      ${value}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-foreground/40 uppercase">Total</span>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  ${displayCategories.reduce((sum, cat) => sum + country.cities.mid[cat], 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
