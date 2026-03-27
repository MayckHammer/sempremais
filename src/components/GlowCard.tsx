import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  onClick?: () => void;
}

export default function GlowCard({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '207 78 45',
  backgroundColor = 'rgba(255,255,255,0.2)',
  borderRadius = 16,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ['#1a6fb5', '#3b9fe0', '#d4a853'],
  onClick,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowState, setGlowState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    angle: number;
  }>({ visible: false, x: 0, y: 0, angle: 0 });
  const [sweepAngle, setSweepAngle] = useState(0);

  useEffect(() => {
    if (!animated) return;
    let frame: number;
    let start: number | null = null;
    const duration = 1200;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setSweepAngle(progress * 360);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [animated]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      const edgeDist = Math.min(x, y, w - x, h - y);
      const threshold = (edgeSensitivity / 100) * Math.min(w, h);

      if (edgeDist < threshold) {
        const centerX = w / 2;
        const centerY = h / 2;
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        setGlowState({ visible: true, x, y, angle });
      } else {
        setGlowState((s) => ({ ...s, visible: false }));
      }
    },
    [edgeSensitivity]
  );

  const handleMouseLeave = useCallback(() => {
    setGlowState((s) => ({ ...s, visible: false }));
  }, []);

  const gradientBorder = `conic-gradient(from 0deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`;
  const animatedBorder = `conic-gradient(from ${sweepAngle}deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`;

  return (
    <motion.div
      ref={cardRef}
      className={`relative group cursor-pointer ${className}`}
      style={{ borderRadius }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-px transition-opacity duration-300 pointer-events-none"
        style={{
          borderRadius: borderRadius + 1,
          background: animated ? animatedBorder : gradientBorder,
          opacity: glowState.visible ? 1 : 0.5,
          filter: `blur(${glowState.visible ? 1 : 0}px)`,
        }}
      />

      {/* Edge glow cone */}
      {glowState.visible && (
        <div
          className="absolute pointer-events-none transition-opacity duration-200"
          style={{
            left: glowState.x - glowRadius,
            top: glowState.y - glowRadius,
            width: glowRadius * 2,
            height: glowRadius * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, hsla(${glowColor} / ${0.6 * glowIntensity}) 0%, transparent 70%)`,
            transform: `rotate(${glowState.angle}deg)`,
            maskImage: `conic-gradient(from ${glowState.angle - coneSpread}deg, black ${coneSpread * 2}deg, transparent 0)`,
            WebkitMaskImage: `conic-gradient(from ${glowState.angle - coneSpread}deg, black ${coneSpread * 2}deg, transparent 0)`,
            zIndex: 2,
          }}
        />
      )}

      {/* Inner card */}
      <div
        className="relative z-10 backdrop-blur-md"
        style={{
          borderRadius,
          backgroundColor,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
