'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';

const FloatingShape = ({ delay, duration, size, x, y, rotate }: { delay: number; duration: number; size: number; x: number; y: number; rotate: number }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-br from-amber-300/20 to-terracotta-400/10 blur-xl"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -30, 0],
      rotate: [rotate, rotate + 180],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const GeometricPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

export default function Hero() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    router.push('/dashboard');
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sand-50 via-sand-100 to-sand-200"
        style={{ y, opacity }}
      >
        <GeometricPattern />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingShape delay={0} duration={20} size={300} x={10} y={20} rotate={0} />
          <FloatingShape delay={2} duration={25} size={200} x={80} y={10} rotate={45} />
          <FloatingShape delay={4} duration={22} size={250} x={60} y={60} rotate={90} />
          <FloatingShape delay={1} duration={18} size={180} x={20} y={70} rotate={135} />
          <FloatingShape delay={3} duration={24} size={220} x={85} y={75} rotate={180} />
        </div>

        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                y: [0, -100],
                x: [0, Math.random() * 40 - 20],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              style={{
                left: `${5 + (i * 5) % 90}%`,
                bottom: `${10 + (i * 7) % 30}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <span className="inline-block text-terracotta-600 font-medium tracking-widest text-sm uppercase mb-4">
              Southeast Asia
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl text-ink-950 leading-[0.9] mb-8"
          >
            NOMAD
            <br />
            <span className="italic text-terracotta-600">COMPASS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-ink-600 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Your personal guide to affordable living in Southeast Asia. 
            Discover real costs, hidden gems, and find where your dream life awaits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.button
              onClick={handleEnter}
              className="group relative inline-flex items-center gap-3 bg-ink-950 text-sand-50 px-8 py-4 rounded-full font-medium text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Explore Destinations</span>
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="transition-transform group-hover:translate-x-1"
              >
                <path
                  d="M4 10h12M12 6l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-terracotta-600 to-amber-500 opacity-0 group-hover:opacity-100 -z-10 transition-opacity"
                layoutId="buttonBackground"
              />
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-ink-400"
          >
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
              <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
              <motion.rect
                x="6"
                y="4"
                width="4"
                height="6"
                rx="2"
                fill="currentColor"
                animate={{ y: [4, 10, 4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-sand-50 to-transparent" />
      </motion.div>
    </AnimatePresence>
  );
}
