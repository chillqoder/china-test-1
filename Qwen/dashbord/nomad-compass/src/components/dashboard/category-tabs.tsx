'use client';

import { categoryLabels, categoryIcons } from '@/data/countries';
import type { CostCategory } from '@/types';

interface CategoryTabsProps {
  activeCategory: CostCategory | 'all';
  onCategoryChange: (category: CostCategory | 'all') => void;
}

const tabs: { key: CostCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '' },
  { key: 'housing', label: categoryLabels.housing, icon: categoryIcons.housing },
  { key: 'food', label: categoryLabels.food, icon: categoryIcons.food },
  { key: 'cafe', label: categoryLabels.cafe, icon: categoryIcons.cafe },
  { key: 'internet', label: categoryLabels.internet, icon: categoryIcons.internet },
  { key: 'transport', label: categoryLabels.transport, icon: categoryIcons.transport },
];

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onCategoryChange(tab.key as CostCategory | 'all')}
          className={`
            relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${
              activeCategory === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-surface text-foreground/60 hover:bg-surface-hover hover:text-foreground/80 border border-border'
            }
          `}
        >
          <span className="flex items-center gap-1.5">
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
