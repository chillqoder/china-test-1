'use client';

import { motion } from 'framer-motion';
import { CitySize } from '@/types';
import { cn } from '@/lib/utils';

interface CitySelectorProps {
  value: CitySize;
  onChange: (size: CitySize) => void;
  cityName: string;
}

const sizes: { id: CitySize; label: string }[] = [
  { id: 'large', label: 'Large' },
  { id: 'mid', label: 'Mid' },
  { id: 'small', label: 'Small' },
];

export default function CitySelector({ value, onChange, cityName }: CitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-sand-100 rounded-lg p-0.5 flex-1">
        {sizes.map(size => (
          <button
            key={size.id}
            onClick={() => onChange(size.id)}
            className={cn(
              'relative flex-1 py-1.5 text-xs font-medium rounded-md transition-colors z-10',
              value === size.id
                ? 'text-ink-950'
                : 'text-ink-500 hover:text-ink-700'
            )}
          >
            {value === size.id && (
              <motion.div
                layoutId="citySelector"
                className="absolute inset-0 bg-white shadow-sm rounded-md"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{size.label}</span>
          </button>
        ))}
      </div>
      <span className="text-sm text-ink-600 font-medium min-w-[80px] text-right">
        {cityName}
      </span>
    </div>
  );
}
