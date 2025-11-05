'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2 } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ShowcaseSectionProps {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

export function ShowcaseSection({ title, subtitle, description, features }: ShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate content
      gsap.from(contentRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Animate mockup
      gsap.from(mockupRef.current, {
        x: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: mockupRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Animate features list
      if (contentRef.current) {
        const featureItems = contentRef.current.querySelectorAll('.feature-item');
        gsap.from(featureItems, {
          x: -20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gra-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div ref={contentRef} className="space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold">
              {subtitle}
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-950 leading-tight">
              {title}
            </h2>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              {description}
            </p>

            {/* Features list */}
            <ul className="space-y-4 pt-4">
              {features.map((feature, index) => (
                <li key={index} className="feature-item flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-700 shrink-0" />
                  <span className="text-gray-800 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup placeholder */}
          <div ref={mockupRef} className="relative">
            <div className="relative aspect-video rounded-2xl bg-linear-to-br from-blue-700 to-purple-700 shadow-2xl overflow-hidden">
              {/* Strong overlay for maximum text contrast */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/20 to-transparent" />
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-grid-white/10" />
              
              {/* Placeholder content */}
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="text-white text-center space-y-4">
                  <div className="text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">📊</div>
                  <p className="text-lg font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Dashboard Preview</p>
                  <p className="text-sm font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Visualización interactiva de datos</p>
                </div>
              </div>

              {/* Floating elements for visual interest */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-white/40 rounded-xl backdrop-blur-sm shadow-2xl border border-white/20" />
              <div className="absolute bottom-4 left-4 w-24 h-16 bg-white/40 rounded-xl backdrop-blur-sm shadow-2xl border border-white/20" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-400 rounded-full blur-3xl opacity-70" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-70" />
          </div>
        </div>
      </div>
    </section>
  );
}
