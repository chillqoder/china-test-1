'use client';

import { motion } from 'framer-motion';
import { CostCategory } from '@/types';

interface CategoryTabsProps {
  activeCategory: CostCategory | null;
  onCategoryChange: (category: CostCategory | null) => void;
}

const tabs: { key: CostCategory | null; label: string }[] = [
  { key: null, label: 'All' },
  { key: 'housing', label: '🏠 Housing' },
  { key: 'food', label: '🍜 Food' },
  { key: 'cafe', label: '☕ Café' },
  { key: 'internet', label: '🌐 Internet' },
  { key: 'transport', label: '🚕 Transport' },
];

export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-warm-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-sand/50">
      {tabs.map((tab) => {
        const isActive = activeCategory === tab.key;
        return (
          <button
            key={tab.key ?? 'all'}
            onClick={() => onCategoryChange(tab.key)}
            className={`relative px-4 py-2.5 rounded-xl text-sm font-body font-medium transition-colors duration-200 cursor-pointer ${
              isActive
                ? 'text-warm-white'
                : 'text-charcoal-light hover:text-charcoal hover:bg-sand-light/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="categoryTab"
                className="absolute inset-0 bg-terracotta rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
