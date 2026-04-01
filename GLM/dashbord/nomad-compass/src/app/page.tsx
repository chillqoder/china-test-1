'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import HeroGradient from '@/components/hero/HeroGradient';

const FloatingShapes = dynamic(() => import('@/components/hero/FloatingShapes'), {
  ssr: false,
});

const headlineWords = ['Your Life', 'Costs Less', 'Than You Think'];
const subtitle =
  'Discover what $800 a month buys across Southeast Asia. Real numbers. Real cities. Your next chapter starts here.';

export default function HeroPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const handleEnter = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => router.push('/dashboard'), 900);
  }, [router]);

  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroGradient />
        <FloatingShapes />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-block text-sm tracking-[0.3em] uppercase text-terracotta font-body font-medium"
            >
              Nomad Compass
            </motion.span>
          </motion.div>

          <h1 className="font-display leading-[1.1] mb-8">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                className={`block ${
                  i === 2
                    ? 'text-5xl sm:text-7xl md:text-8xl font-bold text-terracotta'
                    : 'text-4xl sm:text-6xl md:text-7xl font-bold text-charcoal'
                }`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.5 + i * 0.2,
                  duration: 0.7,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="text-lg sm:text-xl text-charcoal-light max-w-2xl mx-auto leading-relaxed mb-12 font-body"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            <button
              onClick={handleEnter}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-terracotta text-warm-white rounded-full font-body font-semibold text-lg overflow-hidden transition-all duration-300 hover:bg-terracotta-dark hover:shadow-xl hover:shadow-terracotta/20 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <span className="relative z-10">Explore the Map</span>
              <motion.svg
                className="relative z-10 w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                initial={{ x: 0 }}
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
              <div className="absolute inset-0 bg-gradient-to-r from-terracotta-dark to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </motion.div>

          <motion.div
            className="mt-16 flex justify-center gap-8 text-sm text-warm-gray font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.8 }}
          >
            {['8 Countries', '24 Cities', 'Real Costs'].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-warm-gray flex justify-center pt-2"
          >
            <motion.div className="w-1 h-2 rounded-full bg-warm-gray" />
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-50 bg-terracotta flex items-center justify-center"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          >
            <motion.span
              className="text-warm-white font-display text-3xl font-bold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Loading destinations...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
