'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroPage from '@/components/HeroPage';
import DashboardPage from '@/components/DashboardPage';

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-nomad-dark">
      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <motion.div
            key="hero"
            exit={{ 
              opacity: 0,
              scale: 1.1,
              filter: 'blur(20px)',
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <HeroPage onEnter={() => setShowDashboard(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ 
              opacity: 0,
              scale: 0.95,
              filter: 'blur(10px)',
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0, 0.2, 1],
              delay: 0.2,
            }}
          >
            <DashboardPage />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
