"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CountryCard from "@/components/CountryCard";
import {
  countries,
  type Country,
  type CostCategory,
  getTotalMonthly,
} from "@/data/countries";

const categories: (CostCategory | "all")[] = [
  "all",
  "housing",
  "food",
  "cafe",
  "internet",
  "transport",
];

const categoryLabels: Record<CostCategory | "all", string> = {
  all: "All",
  housing: "Housing",
  food: "Food",
  cafe: "Cafe",
  internet: "Internet",
  transport: "Transport",
};

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState<CostCategory | "all">("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [pinned, setPinned] = useState<string[]>([]);

  const togglePin = (id: string) => {
    setPinned((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const sortedCountries = useMemo(() => {
    let result = [...countries];

    if (activeCategory !== "all") {
      result.sort((a, b) => {
        const aValue = a.cities.large[activeCategory];
        const bValue = b.cities.large[activeCategory];
        return sortAsc ? aValue - bValue : bValue - aValue;
      });
    }

    const pinnedCountries = result.filter((c) => pinned.includes(c.id));
    const unpinnedCountries = result.filter((c) => !pinned.includes(c.id));
    return [...pinnedCountries, ...unpinnedCountries];
  }, [activeCategory, sortAsc, pinned]);

  const pinnedCountriesList = useMemo(
    () => countries.filter((c) => pinned.includes(c.id)),
    [pinned]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-teal-50/20 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-stone-900/70 border-b border-stone-200/50 dark:border-stone-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🧭</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 hidden sm:block">
                Nomad Compass
              </span>
            </Link>
            <div className="flex items-center gap-2">
              {pinned.length > 0 && (
                <span className="text-xs text-stone-500 dark:text-stone-400 px-2">
                  {pinned.length}/3 pinned
                </span>
              )}
              <button
                onClick={() => setPinned([])}
                disabled={pinned.length === 0}
                className="text-xs px-3 py-1.5 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Clear pins
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-semibold text-stone-900 dark:text-stone-100 mb-2"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Explore Southeast Asia
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-stone-600 dark:text-stone-400"
          >
            Compare cost of living across 8 countries and 24 cities
          </motion.p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
          {activeCategory !== "all" && (
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="ml-2 px-3 py-2 rounded-full text-sm bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center gap-1"
            >
              {sortAsc ? "↑ Low to High" : "↓ High to Low"}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {pinnedCountriesList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 ring-1 ring-orange-200 dark:ring-orange-800"
            >
              <p className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider mb-3">
                Comparison
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pinnedCountriesList.map((country) => {
                  const city = country.cities.large;
                  const total = getTotalMonthly(city);
                  const value =
                    activeCategory === "all"
                      ? total
                      : city[activeCategory as CostCategory];
                  return (
                    <div
                      key={country.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-stone-800/60"
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                          {country.name}
                        </div>
                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          ${value}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {activeCategory === "all" ? "total/mo" : categoryLabels[activeCategory as CostCategory]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {sortedCountries.map((country, idx) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 16,
                  delay: idx * 0.04,
                }}
              >
                <CountryCard
                  country={country}
                  activeCategory={activeCategory}
                  pinned={pinned.includes(country.id)}
                  onTogglePin={togglePin}
                  highlightCategory={activeCategory !== "all" ? activeCategory : null}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
