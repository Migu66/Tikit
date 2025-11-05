'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  onCtaPrimary?: () => void;
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaPrimary,
  onCtaPrimary,
}: HeroSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .from(titleRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.8,
        })
        .from(
          subtitleRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.4'
        )
        .from(
          descriptionRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          buttonsRef.current?.children || [],
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
          },
          '-=0.2'
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-20 overflow-visible">
  {/* Gradient Background (detrás del contenido) */}
  <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-600 via-purple-600 to-blue-700" />
      
      <div className="relative max-w-5xl w-full text-center space-y-8 overflow-visible">
        <h1
          ref={titleRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent overflow-visible sm:leading-[1.12] md:leading-[1.08] lg:leading-[1.06] pb-3"
        >
          {title}
        </h1>
        
        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl md:text-3xl text-gray-800 max-w-3xl mx-auto font-medium"
        >
          {subtitle}
        </p>
        
        <p
          ref={descriptionRef}
          className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed"
        >
          {description}
        </p>

        {/* CTA Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={onCtaPrimary}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
            }}
            className="px-14 py-5 rounded-full text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer hover:opacity-90"
          >
            {ctaPrimary}
          </button>
        </div>
      </div>
    </section>
  );
}
