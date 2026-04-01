'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Shape {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: 'triangle' | 'circle' | 'diamond' | 'ring' | 'line';
  color: string;
  duration: number;
  delay: number;
  driftX: number[];
  driftY: number[];
}

const colors = [
  'rgba(196, 101, 74, 0.12)',
  'rgba(26, 83, 92, 0.08)',
  'rgba(212, 168, 83, 0.10)',
  'rgba(232, 213, 183, 0.15)',
  'rgba(196, 101, 74, 0.06)',
  'rgba(26, 83, 92, 0.05)',
];

const types = ['triangle', 'circle', 'diamond', 'ring', 'line'] as const;

function generateShapes(): Shape[] {
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 80,
    rotation: Math.random() * 360,
    type: types[Math.floor(Math.random() * 5)],
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 15 + Math.random() * 25,
    delay: Math.random() * 5,
    driftX: [0, Math.random() * 60 - 30, Math.random() * 40 - 20],
    driftY: [0, Math.random() * 60 - 30, Math.random() * 40 - 20],
  }));
}

export default function FloatingShapes() {
  const [shapes] = useState<Shape[]>(generateShapes);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.8],
            x: shape.driftX,
            y: shape.driftY,
            rotate: [shape.rotation, shape.rotation + 45, shape.rotation + 90],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {shape.type === 'triangle' && (
              <polygon
                points="50,10 90,90 10,90"
                fill="none"
                stroke={shape.color}
                strokeWidth="2"
              />
            )}
            {shape.type === 'circle' && (
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={shape.color}
                strokeWidth="2"
              />
            )}
            {shape.type === 'diamond' && (
              <polygon
                points="50,5 95,50 50,95 5,50"
                fill={shape.color}
              />
            )}
            {shape.type === 'ring' && (
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke={shape.color}
                strokeWidth="4"
              />
            )}
            {shape.type === 'line' && (
              <line
                x1="10"
                y1="50"
                x2="90"
                y2="50"
                stroke={shape.color}
                strokeWidth="2"
              />
            )}
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
