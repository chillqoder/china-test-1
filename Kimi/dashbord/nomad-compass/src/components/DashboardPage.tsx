'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { countries } from '@/data/countries';
import { Country, CitySize, CostCategory, SortDirection } from '@/types';
import { 
  getCategoryValue, 
  getCategoryLabel, 
  getCategoryIcon,
  calculateMonthlyTotal 
} from '@/lib/utils';
import CountryCard from './CountryCard';
import ComparisonPanel from './ComparisonPanel';
import { ArrowUpDown, Filter, Pin } from 'lucide-react';

const categories: (CostCategory | 'all')[] = ['all', 'housing', 'food', 'cafe', 'internet', 'transport'];

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState<CostCategory | 'all'>('all');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [pinnedCountries, setPinnedCountries] = useState<string[]>([]);
  const [selectedCitySize, setSelectedCitySize] = useState<CitySize>('mid');

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

  const sortedCountries = useMemo(() => {
    let sorted = [...countries];
    
    if (activeCategory !== 'all') {
      sorted.sort((a, b) => {
        const valueA = getCategoryValue(a.cities[selectedCitySize], activeCategory);
        const valueB = getCategoryValue(b.cities[selectedCitySize], activeCategory);
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      });
    } else {
      // Sort by total monthly cost when "all" is selected
      sorted.sort((a, b) => {
        const totalA = calculateMonthlyTotal(a.cities[selectedCitySize]);
        const totalB = calculateMonthlyTotal(b.cities[selectedCitySize]);
        return sortDirection === 'asc' ? totalA - totalB : totalB - totalA;
      });
    }

    // Move pinned countries to the front
    const pinned = sorted.filter(c => pinnedCountries.includes(c.id));
    const unpinned = sorted.filter(c => !pinnedCountries.includes(c.id));
    return [...pinned, ...unpinned];
  }, [activeCategory, sortDirection, pinnedCountries, selectedCitySize]);

  const pinnedData = useMemo(() => {
    return countries.filter(c => pinnedCountries.includes(c.id));
  }, [pinnedCountries]);

  return (
    <div className="min-h-screen bg-nomad-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nomad-accent to-nomad-coral flex items-center justify-center">
                <span className="text-xl">🧭</span>
              </div>
              <div>
                <h1 className="font-serif text-xl font-medium text-white">Nomad Compass</h1>
                <p className="text-xs text-slate-500">Southeast Asia Cost of Living</p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-nomad-accent text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cat === 'all' ? 'All' : `${getCategoryIcon(cat as CostCategory)} ${getCategoryLabel(cat as CostCategory)}`}
                </motion.button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* City Size Toggle */}
              <div className="flex items-center bg-slate-800 rounded-lg p-1">
                {(['large', 'mid', 'small'] as CitySize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedCitySize(size)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      selectedCitySize === size
                        ? 'bg-slate-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {size === 'large' ? 'Large City' : size === 'mid' ? 'Mid City' : 'Small Town'}
                  </button>
                ))}
              </div>

              {/* Sort Toggle */}
              <motion.button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {sortDirection === 'asc' ? 'Cheapest First' : 'Most Expensive'}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Comparison Panel */}
      <AnimatePresence>
        {pinnedData.length > 0 && (
          <ComparisonPanel 
            countries={pinnedData} 
            activeCategory={activeCategory}
            selectedCitySize={selectedCitySize}
            onRemove={(id) => togglePin(id)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pinned indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-nomad-gold" />
            <span className="text-sm text-slate-400">
              {pinnedCountries.length > 0 
                ? `${pinnedCountries.length}/3 countries pinned for comparison`
                : 'Pin up to 3 countries to compare'
              }
            </span>
          </div>
          <span className="text-sm text-slate-500">
            Showing {sortedCountries.length} countries
          </span>
        </div>

        {/* Country Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence mode="popLayout">
            {sortedCountries.map((country, index) => (
              <CountryCard
                key={country.id}
                country={country}
                activeCategory={activeCategory}
                selectedCitySize={selectedCitySize}
                isPinned={pinnedCountries.includes(country.id)}
                onTogglePin={() => togglePin(country.id)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm">
            Data based on 2024 cost-of-living estimates. Prices in USD. Local currency equivalents are approximate.
          </p>
        </div>
      </footer>
    </div>
  );
}
