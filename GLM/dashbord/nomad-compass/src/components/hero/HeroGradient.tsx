'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroGradient() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const gradientY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0"
      style={{ y: gradientY }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-sand-light to-cream-dark opacity-80" />
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-terracotta/[0.06] to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-teal/[0.05] to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-gradient-to-r from-gold/[0.04] to-transparent rounded-full blur-3xl" />
    </motion.div>
  );
}
