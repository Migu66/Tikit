'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import Link from 'next/link';
import Button from '@/components/ui/button';

interface NotFoundContentProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonBackText?: string;
}

export default function NotFoundContent({
  title = 'Página no encontrada',
  description = 'Lo sentimos, la página que buscas no existe o ha sido eliminada.',
  buttonText = 'Ir al inicio',
  buttonBackText = 'Volver atrás',
}: NotFoundContentProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Timeline para la animación de entrada
    const tl = gsap.timeline();

    // Animar elementos flotantes
    floatingElementsRef.current.forEach((el, index) => {
      gsap.to(el, {
        y: gsap.utils.random(-20, 20),
        x: gsap.utils.random(-15, 15),
        duration: gsap.utils.random(4, 6),
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: index * 0.2,
      });
    });

    // Animación principal de entrada
    tl.from(titleRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
    })
      .from(
        descriptionRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out',
        },
        '-=0.4'
      )
      .from(
        buttonsRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out',
        },
        '-=0.3'
      );

    // Animación del número 404
    const numberElement = titleRef.current?.querySelector('.number-404');
    if (numberElement) {
      // Escala de pulso
      gsap.to(numberElement, {
        scale: 1.05,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4"
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-linear-to-r from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-linear-to-r from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-linear-to-r from-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Elementos flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) floatingElementsRef.current[i] = el;
            }}
            className={`absolute w-2 h-2 bg-linear-to-r from-purple-400 to-pink-400 rounded-full ${
              ['top-1/4 left-1/3', 'top-1/3 right-1/4', 'bottom-1/3 left-1/4', 'top-2/3 right-1/3', 'bottom-1/4 left-2/3'][i]
            }`}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Número 404 */}
        <div
          ref={titleRef}
          className="mb-8"
        >
          <div className="number-404 text-9xl md:text-[150px] font-bold bg-linear-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl leading-none">
            404
          </div>
        </div>

        {/* Descripción */}
        <div ref={descriptionRef} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Botones */}
        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/">
            <Button className="w-full sm:w-auto px-8 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              {buttonText}
            </Button>
          </Link>
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-8 py-3 border-2 border-slate-400 text-slate-300 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:border-purple-400 hover:text-purple-300 hover:shadow-lg"
          >
            {buttonBackText}
          </button>
        </div>

        {/* Elemento decorativo inferior */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-linear-to-r from-purple-400 to-pink-400 rounded-full"
              style={{
                animation: `pulse ${1.5 + i * 0.2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
