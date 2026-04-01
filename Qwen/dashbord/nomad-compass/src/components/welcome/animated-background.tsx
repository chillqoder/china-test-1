'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 5,
}));

const geometricShapes = [
  { id: 1, type: 'circle', x: 15, y: 20, size: 80, color: 'rgba(124, 58, 237, 0.15)', duration: 25 },
  { id: 2, type: 'circle', x: 75, y: 60, size: 120, color: 'rgba(245, 158, 11, 0.1)', duration: 30 },
  { id: 3, type: 'square', x: 60, y: 15, size: 60, color: 'rgba(249, 115, 22, 0.12)', duration: 22, rotation: 45 },
  { id: 4, type: 'circle', x: 25, y: 70, size: 50, color: 'rgba(167, 139, 250, 0.1)', duration: 28 },
  { id: 5, type: 'square', x: 85, y: 30, size: 40, color: 'rgba(124, 58, 237, 0.1)', duration: 20, rotation: 30 },
];

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1a] via-[#1a1028] to-[#0a0f1e]" />

      {/* Geometric shapes */}
      {geometricShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            background: shape.color,
            borderRadius: shape.type === 'circle' ? '50%' : '8px',
            transform: shape.rotation ? `rotate(${shape.rotation}deg)` : undefined,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: shape.rotation ? [shape.rotation, shape.rotation + 360, shape.rotation] : [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.id % 3 === 0
              ? 'rgba(245, 158, 11, 0.3)'
              : particle.id % 3 === 1
              ? 'rgba(124, 58, 237, 0.3)'
              : 'rgba(249, 115, 22, 0.25)',
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
