'use client';

import type { CSSProperties } from 'react';

interface MarqueeProps {
  text: string;
  className?: string;
  /** Segundos por vuelta completa. */
  duration?: number;
  reverse?: boolean;
  /** Veces que se repite el texto dentro de cada mitad de la cinta. */
  repeat?: number;
}

/**
 * Cinta de texto infinita. Dos mitades idénticas y translateX(-50%) en bucle:
 * solo transform, sin reflow. Con prefers-reduced-motion queda estática.
 */
export function Marquee({
  text,
  className = '',
  duration = 26,
  reverse = false,
  repeat = 4,
}: MarqueeProps) {
  const half = Array.from({ length: repeat }, () => text).join('');

  return (
    <div
      className={`tk-marquee ${reverse ? 'tk-marquee-reverse' : ''} ${className}`}
      style={{ '--tk-marquee-dur': `${duration}s` } as CSSProperties}
    >
      <div className="tk-marquee-track">
        <span className="shrink-0 whitespace-pre">{half}</span>
        <span className="shrink-0 whitespace-pre" aria-hidden="true">
          {half}
        </span>
      </div>
    </div>
  );
}
