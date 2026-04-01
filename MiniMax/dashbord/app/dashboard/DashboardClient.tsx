'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Country, CitySize, CostCategory } from '@/types';
import { cn } from '@/lib/utils';
import CountryCard from '@/components/CountryCard';
import CategoryTabs from '@/components/CategoryTabs';
import ComparisonStrip from '@/components/ComparisonStrip';

interface DashboardClientProps {
  countries: Country[];
}

export default function DashboardClient({ countries }: DashboardClientProps) {
  const [activeCategory, setActiveCategory] = useState<CostCategory | 'all'>('all');
  const [citySize, setCitySize] = useState<CitySize>('large');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pinnedCountries, setPinnedCountries] = useState<string[]>([]);

  const getCategoryValue = (country: Country, category: CostCategory): number => {
    return country.cities[citySize][category];
  };

  const sortedCountries = [...countries].sort((a, b) => {
    if (activeCategory === 'all') return 0;
    const aValue = getCategoryValue(a, activeCategory);
    const bValue = getCategoryValue(b, activeCategory);
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const pinned = sortedCountries.filter(c => pinnedCountries.includes(c.id));
  const unpinned = sortedCountries.filter(c => !pinnedCountries.includes(c.id));

  const togglePin = (countryId: string) => {
    setPinnedCountries(prev => {
      if (prev.includes(countryId)) {
        return prev.filter(id => id !== countryId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), countryId];
      }
      return [...prev, countryId];
    });
  };

  const categoryValues = activeCategory !== 'all' 
    ? sortedCountries.map(c => ({ id: c.id, value: getCategoryValue(c, activeCategory) }))
    : [];

  return (
    <div className="min-h-screen bg-sand-50">
      <header className="sticky top-0 z-50 bg-sand-50/80 backdrop-blur-xl border-b border-sand-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif text-2xl text-ink-950">
                NOMAD <span className="italic text-terracotta-600">COMPASS</span>
              </h1>
              <p className="text-sm text-ink-500">Southeast Asia Cost of Living</p>
            </div>
            <div className="flex items-center gap-4">
              <CategoryTabs
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onSortDirectionChange={setSortDirection}
                sortDirection={sortDirection}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {pinned.map((country, index) => (
              <CountryCard
                key={country.id}
                country={country}
                citySize={citySize}
                onCitySizeChange={setCitySize}
                isPinned={true}
                isPinnedIndex={pinnedCountries.indexOf(country.id)}
                onTogglePin={() => togglePin(country.id)}
                activeCategory={activeCategory}
                categoryValues={categoryValues}
              />
            ))}
            {unpinned.map((country, index) => (
              <CountryCard
                key={country.id}
                country={country}
                citySize={citySize}
                onCitySizeChange={setCitySize}
                isPinned={false}
                isPinnedIndex={-1}
                onTogglePin={() => togglePin(country.id)}
                activeCategory={activeCategory}
                categoryValues={categoryValues}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      <ComparisonStrip
        countries={countries.filter(c => pinnedCountries.includes(c.id))}
        citySize={citySize}
        activeCategory={activeCategory}
        onRemove={(id) => setPinnedCountries(prev => prev.filter(cId => cId !== id))}
      />
    </div>
  );
}
