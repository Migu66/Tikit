'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FinalCTASectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  trustIndicator1: string;
  trustIndicator2: string;
  trustIndicator3: string;
  onButtonClick?: () => void;
}

export function FinalCTASection({ title, subtitle, buttonText, trustIndicator1, trustIndicator2, trustIndicator3, onButtonClick }: FinalCTASectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-100">
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/10" />
      
      <div ref={contentRef} className="relative max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          {title}
        </h2>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>

        <div className="pt-4">
          <button
            onClick={onButtonClick}
            className="group relative px-10 py-5 text-lg font-semibold rounded-full bg-linear-to-r from-blue-600 to-purple-600 text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="relative z-10">{buttonText}</span>
            <div className="absolute inset-0 bg-linear-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Trust indicators */}
        <div className="pt-8 flex flex-wrap justify-center items-center gap-8 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{trustIndicator1}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{trustIndicator2}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{trustIndicator3}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
