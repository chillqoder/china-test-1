'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { countries as allCountries } from '@/data/countries';
import type { CostCategory, CitySize, SortDirection } from '@/types';
import { CountryCard } from '@/components/dashboard/country-card';
import { CategoryTabs } from '@/components/dashboard/category-tabs';
import { ComparisonPanel } from '@/components/dashboard/comparison-panel';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function DashboardContent() {
  const [activeCategory, setActiveCategory] = useState<CostCategory | 'all'>('all');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [pinnedCountries, setPinnedCountries] = useState<string[]>([]);

  const togglePin = (countryId: string) => {
    setPinnedCountries((prev) => {
      if (prev.includes(countryId)) {
        return prev.filter((id) => id !== countryId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, countryId];
    });
  };

  const sortedCountries = useMemo(() => {
    const sorted = [...allCountries].sort((a, b) => {
      // Pinned first
      const aPinned = pinnedCountries.includes(a.id) ? 0 : 1;
      const bPinned = pinnedCountries.includes(b.id) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;

      // Then sort by active category
      if (activeCategory === 'all') return 0;

      const getValue = (country: typeof a, citySize: CitySize) => {
        const city = country.cities[citySize];
        return city[activeCategory as CostCategory];
      };

      // Use mid-size city for sorting
      const aVal = getValue(a, 'mid');
      const bVal = getValue(b, 'mid');

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [activeCategory, sortDirection, pinnedCountries]);

  const pinnedData = useMemo(() => {
    return allCountries.filter((c) => pinnedCountries.includes(c.id));
  }, [pinnedCountries]);

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Cost of Living
            </h1>
            <p className="text-foreground/50 mt-1">
              Compare monthly expenses across Southeast Asia
            </p>
          </div>

          {/* Sort toggle */}
          {activeCategory !== 'all' && (
            <button
              onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:border-border-hover transition-colors"
            >
              <span className="text-sm text-foreground/60">
                {sortDirection === 'asc' ? 'Cheapest first' : 'Most expensive first'}
              </span>
              {sortDirection === 'asc' ? (
                <ArrowDown className="w-4 h-4 text-accent" />
              ) : (
                <ArrowUp className="w-4 h-4 text-accent" />
              )}
            </button>
          )}
        </div>

        {/* Category tabs */}
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Comparison panel */}
      {pinnedCountries.length > 0 && (
        <div className="max-w-7xl mx-auto mb-8">
          <ComparisonPanel
            pinnedCountries={pinnedData}
            activeCategory={activeCategory}
            onUnpin={(id) => setPinnedCountries((prev) => prev.filter((c) => c !== id))}
          />
        </div>
      )}

      {/* Country grid */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          layout
        >
          {sortedCountries.map((country, index) => (
            <motion.div
              key={country.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <CountryCard
                country={country}
                activeCategory={activeCategory}
                isPinned={pinnedCountries.includes(country.id)}
                canPin={pinnedCountries.length < 3}
                onTogglePin={() => togglePin(country.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
