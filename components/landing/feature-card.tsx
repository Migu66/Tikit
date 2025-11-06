'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon, title, description, index = 0 }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        }
      });
    });

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group relative p-8 rounded-2xl bg-white border-2 border-gray-300 shadow-lg hover:border-blue-600 transition-all duration-300 hover:shadow-2xl hover:scale-105"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-linear-to-br from-blue-200 to-purple-200 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 text-center text-gray-950">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-700 text-center leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
