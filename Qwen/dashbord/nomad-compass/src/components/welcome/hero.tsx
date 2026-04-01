'use client';

import { motion, type Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Compass } from 'lucide-react';

export default function Hero() {
  const router = useRouter();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, delay: 1.2 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <motion.div
        className="relative z-10 max-w-3xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Compass icon */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center"
            >
              <Compass className="w-10 h-10 text-accent" strokeWidth={1.5} />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={itemVariants}
          className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
        >
          <span className="block text-foreground">Find Your</span>
          <span className="block bg-gradient-to-r from-accent via-coral to-primary-light bg-clip-text text-transparent">
            Southeast Asia
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-foreground/70 mb-4 max-w-xl mx-auto leading-relaxed"
        >
          Real costs. Real cities. Real possibilities.
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-base text-foreground/50 mb-12 max-w-lg mx-auto leading-relaxed"
        >
          Explore what it truly costs to live, work, and thrive across 8 countries and 24 cities in Southeast Asia. Your next chapter might be closer than you think.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => router.push('/dashboard')}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-light rounded-full text-white font-medium text-lg overflow-hidden"
        >
          <span className="relative z-10">Explore the Dashboard</span>
          <ArrowRight
            className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1"
            strokeWidth={2}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-coral opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>

        {/* Bottom decorative text */}
        <motion.p
          variants={itemVariants}
          className="mt-16 text-xs text-foreground/30 tracking-widest uppercase"
        >
          8 Countries · 24 Cities · One Decision
        </motion.p>
      </motion.div>
    </div>
  );
}
