'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CitySize, CostCategory, SortDirection } from '@/types';
import { countries as countriesData } from '@/data/countries';
import CategoryTabs from './CategoryTabs';
import CountryCard from './CountryCard';
import ComparisonPanel from './ComparisonPanel';

export default function DashboardClient() {
  const [activeCategory, setActiveCategory] = useState<CostCategory | null>(null);
  const [citySize, setCitySize] = useState<CitySize>('mid');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const router = useRouter();

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const toggleSort = useCallback(() => {
    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
  }, []);

  const sortedCountries = useMemo(() => {
    const sorted = [...countriesData].sort((a, b) => {
      if (activeCategory) {
        const aVal = a.cities[citySize][activeCategory];
        const bVal = b.cities[citySize][activeCategory];
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aTotal =
        a.cities[citySize].housing +
        a.cities[citySize].food +
        a.cities[citySize].internet +
        a.cities[citySize].transport;
      const bTotal =
        b.cities[citySize].housing +
        b.cities[citySize].food +
        b.cities[citySize].internet +
        b.cities[citySize].transport;
      return sortDirection === 'asc' ? aTotal - bTotal : bTotal - aTotal;
    });

    const pinned = sorted.filter((c) => pinnedIds.includes(c.id));
    const unpinned = sorted.filter((c) => !pinnedIds.includes(c.id));
    return [...pinned, ...unpinned];
  }, [activeCategory, citySize, sortDirection, pinnedIds]);

  const pinnedCountries = useMemo(
    () => countriesData.filter((c) => pinnedIds.includes(c.id)),
    [pinnedIds]
  );

  const activeLabel = activeCategory
    ? { housing: 'Housing', food: 'Food', cafe: 'Café', internet: 'Internet', transport: 'Transport' }[activeCategory]
    : 'Monthly Total';

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-sand/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-sm font-body text-warm-gray hover:text-terracotta transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="font-display text-xl font-bold text-charcoal">
              Nomad <span className="text-terracotta">Compass</span>
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-charcoal">
              Cost of Living Dashboard
            </h2>
            <p className="text-sm text-warm-gray font-body mt-1">
              Explore real monthly costs across Southeast Asia
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-8"
        >
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-warm-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-sand/50">
              {(['large', 'mid', 'small'] as const).map((size) => {
                const labels: Record<CitySize, string> = {
                  large: '🏙️ Large',
                  mid: '🏘️ Mid',
                  small: '🏡 Small',
                };
                const isActive = citySize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setCitySize(size)}
                    className={`relative px-4 py-2 rounded-xl text-sm font-body font-medium transition-colors duration-200 cursor-pointer ${
                      isActive ? 'text-warm-white' : 'text-charcoal-light hover:text-charcoal'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="globalCityTab"
                        className="absolute inset-0 bg-teal rounded-xl"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{labels[size]}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={toggleSort}
              className="flex items-center gap-2 px-4 py-2.5 bg-warm-white/80 backdrop-blur-sm rounded-xl text-sm font-body font-medium text-charcoal-light hover:text-charcoal shadow-sm border border-sand/50 transition-colors cursor-pointer"
            >
              <motion.svg
                className="w-4 h-4"
                animate={{ rotate: sortDirection === 'asc' ? 0 : 180 }}
                transition={{ duration: 0.3 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </motion.svg>
              <span>{sortDirection === 'asc' ? 'Cheapest' : 'Priciest'}</span>
              <span className="text-xs text-warm-gray">by {activeLabel}</span>
            </button>
          </div>
        </motion.div>

        <div className="mb-8">
          <ComparisonPanel
            pinnedCountries={pinnedCountries}
            citySize={citySize}
            activeCategory={activeCategory}
            onUnpin={(id) => togglePin(id)}
          />
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {sortedCountries.map((country, index) => (
              <CountryCard
                key={country.id}
                country={country}
                citySize={citySize}
                activeCategory={activeCategory}
                isPinned={pinnedIds.includes(country.id)}
                onTogglePin={togglePin}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.footer
          className="mt-16 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-warm-gray font-body">
            Nomad Compass · Prices are monthly estimates in USD · Data sourced 2025
          </p>
          <p className="text-xs text-warm-gray/60 font-body mt-1">
            Pin up to 3 countries to compare side by side
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
