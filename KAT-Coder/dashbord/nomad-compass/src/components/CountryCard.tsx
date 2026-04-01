"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Country, CitySize, CostCategory } from "@/data/countries";
import { getTotalMonthly, categoryIcons } from "@/data/countries";

interface CountryCardProps {
  country: Country;
  activeCategory: CostCategory | "all";
  pinned: boolean;
  onTogglePin: (id: string) => void;
  highlightCategory?: CostCategory | null;
}

const citySizeLabels: Record<CitySize, string> = {
  large: "Large",
  mid: "Mid",
  small: "Small",
};

function formatCurrency(value: number, rate: number, currencyCode: string): string {
  if (rate >= 1000) {
    const local = Math.round(value * rate / 1000);
    return `${currencyCode} ${local.toLocaleString()}k`;
  }
  return `${currencyCode} ${Math.round(value * rate).toLocaleString()}`;
}

export default function CountryCard({
  country,
  activeCategory,
  pinned,
  onTogglePin,
  highlightCategory,
}: CountryCardProps) {
  const [citySize, setCitySize] = useState<CitySize>("large");
  const city = country.cities[citySize];
  const total = getTotalMonthly(city);

  const categories: { key: CostCategory; value: number; label: string }[] = [
    { key: "housing", value: city.housing, label: "Housing" },
    { key: "food", value: city.food, label: "Food" },
    { key: "cafe", value: city.cafe, label: "Cafe" },
    { key: "internet", value: city.internet, label: "Internet" },
    { key: "transport", value: city.transport, label: "Transport" },
  ];

  const sortedCategories = useMemo(() => {
    if (activeCategory === "all") return categories;
    const active = categories.filter((c) => c.key === activeCategory);
    const others = categories.filter((c) => c.key !== activeCategory);
    return [...active, ...others];
  }, [categories, activeCategory]);

  const isHighlighted = (key: CostCategory) =>
    highlightCategory === key || activeCategory === key;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className={`relative rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 ${
        pinned
          ? "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 ring-2 ring-orange-400 dark:ring-orange-600"
          : "bg-white/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{country.flag}</span>
            <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              {country.name}
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {country.currency} · 1 USD = {country.usdRate.toLocaleString()} {country.currencyCode}
          </p>
        </div>
        <button
          onClick={() => onTogglePin(country.id)}
          className={`p-2 rounded-full transition-all duration-200 ${
            pinned
              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
              : "bg-stone-100 text-stone-400 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600"
          }`}
          title={pinned ? "Unpin" : "Pin for comparison"}
        >
          <svg
            className="w-4 h-4"
            fill={pinned ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>

      <div className="flex gap-1.5 mb-4 bg-stone-100 dark:bg-stone-700 rounded-lg p-1">
        {(["large", "mid", "small"] as CitySize[]).map((size) => (
          <button
            key={size}
            onClick={() => setCitySize(size)}
            className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-all duration-200 ${
              citySize === size
                ? "bg-white dark:bg-stone-600 text-stone-900 dark:text-stone-100 shadow-sm font-medium"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            }`}
          >
            {citySizeLabels[size]}
          </button>
        ))}
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 font-medium">
        {city.name}
      </p>

      <div className="space-y-2.5">
        {sortedCategories.map((cat, idx) => {
          const highlighted = isHighlighted(cat.key);
          const isActive = activeCategory === cat.key;
          return (
            <motion.div
              layout
              key={cat.key}
              initial={false}
              animate={{
                backgroundColor: highlighted
                  ? "rgba(251, 146, 60, 0.08)"
                  : "transparent",
              }}
              transition={{ duration: 0.2 }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 ${
                highlighted ? "ring-1 ring-orange-300 dark:ring-orange-700" : ""
              }`}
              style={{
                opacity: activeCategory !== "all" && !highlighted ? 0.7 : 1,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{categoryIcons[cat.key]}</span>
                <span
                  className={`text-sm ${
                    highlighted
                      ? "font-semibold text-orange-700 dark:text-orange-300"
                      : "text-stone-600 dark:text-stone-400"
                  }`}
                >
                  {cat.label}
                </span>
              </div>
              <div className="text-right">
                <motion.span
                  key={`${citySize}-${cat.key}`}
                  initial={{ opacity: 0.5, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-base font-semibold ${
                    highlighted
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-stone-900 dark:text-stone-100"
                  }`}
                >
                  ${cat.value}
                </motion.span>
                <div className="text-[10px] text-stone-400 dark:text-stone-500">
                  {formatCurrency(cat.value, country.usdRate, country.currencyCode)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
          Monthly estimate
        </span>
        <div className="text-right">
          <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
            ${total}
          </span>
          <div className="text-[10px] text-stone-400 dark:text-stone-500">
            {formatCurrency(total, country.usdRate, country.currencyCode)}/mo
          </div>
        </div>
      </div>
    </motion.div>
  );
}
