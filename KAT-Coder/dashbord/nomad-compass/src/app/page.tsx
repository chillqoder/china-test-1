"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";

function FloatingShape({
  delay,
  duration,
  x,
  y,
  scale,
  color,
  borderRadius,
}: {
  delay: number;
  duration: number;
  x: number;
  y: number;
  scale: number;
  color: string;
  borderRadius: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.08, 0.15, 0.08],
        scale: [scale * 0.8, scale * 1.2, scale * 0.8],
        x: [x - 30, x + 30, x - 30],
        y: [y - 20, y + 20, y - 20],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: 120,
        height: 120,
        background: color,
        borderRadius,
        filter: "blur(40px)",
      }}
    />
  );
}

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 119, 6, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800" />
      
      <FloatingShape delay={0} duration={12} x={100} y={200} scale={1.5} color="#c2410c" borderRadius="50%" />
      <FloatingShape delay={3} duration={15} x={500} y={100} scale={2} color="#d97706" borderRadius="30%" />
      <FloatingShape delay={6} duration={18} x={300} y={400} scale={1.2} color="#0f766e" borderRadius="60% 40% 60% 40%" />
      <FloatingShape delay={2} duration={14} x={700} y={300} scale={1.8} color="#ea580c" borderRadius="40%" />
      
      <ParticleField />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center px-6 max-w-4xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium tracking-wide uppercase bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
            Southeast Asia Cost of Living
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.1] mb-8"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          <span className="block text-stone-900 dark:text-stone-100">Live More.</span>
          <span className="block text-orange-600 dark:text-orange-400">Spend Less.</span>
          <span className="block text-teal-700 dark:text-teal-400 text-4xl md:text-6xl lg:text-7xl mt-2">Go East.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Discover what your money can really buy across eight Southeast Asian countries.
          From Bangkok street food to Bali co-working cafes — see the real numbers that
          make the dream possible.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full text-lg font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-shadow duration-300"
            >
              <span>Explore the Numbers</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-stone-500 dark:text-stone-500 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🇹🇭</span>
            <span>Thailand</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇻🇳</span>
            <span>Vietnam</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇩</span>
            <span>Indonesia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇲🇾</span>
            <span>Malaysia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇵🇭</span>
            <span>Philippines</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇰🇭</span>
            <span>Cambodia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇱🇦</span>
            <span>Laos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇲🇲</span>
            <span>Myanmar</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
