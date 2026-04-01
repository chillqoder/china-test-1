'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, PinOff, Home, Utensils, Coffee, Wifi, Car } from 'lucide-react';
import { Country, CitySize, CostCategory } from '@/types';
import { 
  formatCurrency, 
  formatLocalCurrency, 
  calculateMonthlyTotal,
  getCategoryLabel,
  getCategoryIcon 
} from '@/lib/utils';

interface CountryCardProps {
  country: Country;
  activeCategory: CostCategory | 'all';
  selectedCitySize: CitySize;
  isPinned: boolean;
  onTogglePin: () => void;
  index: number;
}

const categoryIcons: Record<CostCategory, React.ReactNode> = {
  housing: <Home className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  cafe: <Coffee className="w-4 h-4" />,
  internet: <Wifi className="w-4 h-4" />,
  transport: <Car className="w-4 h-4" />,
};

const citySizeLabels: Record<CitySize, string> = {
  large: 'Large City',
  mid: 'Mid-size City',
  small: 'Small Town',
};

export default function CountryCard({
  country,
  activeCategory,
  selectedCitySize,
  isPinned,
  onTogglePin,
  index,
}: CountryCardProps) {
  const [citySize, setCitySize] = useState<CitySize>(selectedCitySize);
  const cityData = country.cities[citySize];
  const monthlyTotal = calculateMonthlyTotal(cityData);

  // Sync with parent city size selection
  if (citySize !== selectedCitySize) {
    setCitySize(selectedCitySize);
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1] as const,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isPinned 
          ? 'ring-2 ring-nomad-gold shadow-lg shadow-nomad-gold/10' 
          : 'hover:ring-1 hover:ring-slate-600'
      }`}
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-xl" />
      
      {/* Pinned badge */}
      {isPinned && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 z-20"
        >
          <div className="flex items-center gap-1 px-2 py-1 bg-nomad-gold/20 rounded-full">
            <Pin className="w-3 h-3 text-nomad-gold" />
            <span className="text-xs text-nomad-gold font-medium">Pinned</span>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{country.flag}</span>
            <div>
              <h3 className="text-xl font-semibold text-white">{country.name}</h3>
              <p className="text-sm text-slate-400">
                1 USD = {country.usdRate.toLocaleString()} {country.currencyCode}
              </p>
            </div>
          </div>
          <motion.button
            onClick={onTogglePin}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full transition-colors ${
              isPinned 
                ? 'bg-nomad-gold/20 text-nomad-gold' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* City Display */}
        <div className="mb-6">
          <motion.div
            key={cityData.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-serif text-white">{cityData.name}</span>
            <span className="px-2 py-0.5 text-xs bg-slate-700 rounded-full text-slate-300">
              {citySizeLabels[citySize]}
            </span>
          </motion.div>
        </div>

        {/* Cost Categories */}
        <div className="space-y-3 mb-6">
          {(['housing', 'food', 'cafe', 'internet', 'transport'] as CostCategory[]).map((category) => {
            const value = cityData[category];
            const isHighlighted = activeCategory === category;
            const localValue = formatLocalCurrency(value, country.usdRate);
            
            return (
              <motion.div
                key={category}
                layout
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  isHighlighted 
                    ? 'bg-nomad-accent/20 ring-1 ring-nomad-accent/50' 
                    : 'bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    isHighlighted ? 'bg-nomad-accent/30 text-nomad-accent-light' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {categoryIcons[category]}
                  </div>
                  <span className={`text-sm ${isHighlighted ? 'text-white font-medium' : 'text-slate-400'}`}>
                    {getCategoryLabel(category)}
                  </span>
                </div>
                <div className="text-right">
                  <motion.div
                    key={`${cityData.name}-${category}-${value}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-lg font-semibold ${
                      isHighlighted ? 'text-nomad-accent-light' : 'text-slate-200'
                    }`}
                  >
                    {category === 'cafe' ? '$' : ''}{value}
                    {category === 'cafe' ? '/visit' : ''}
                  </motion.div>
                  <p className="text-xs text-slate-500">
                    {localValue} {country.currencyCode}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Monthly Total */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Estimated Monthly Total</span>
            <motion.div
              key={`${cityData.name}-total`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-right"
            >
              <span className="text-2xl font-bold text-white">
                {formatCurrency(monthlyTotal)}
              </span>
              <p className="text-xs text-slate-500">
                ≈ {formatLocalCurrency(monthlyTotal, country.usdRate)} {country.currencyCode}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hover gradient effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-nomad-accent/5 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}
