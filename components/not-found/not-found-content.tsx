'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import Link from 'next/link';

interface NotFoundContentProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonBackText?: string;
}

/**
 * 404 como recibo anulado: el número gigante en hueco, un sello VOID
 * inclinado y una marquesina de ERROR recorriendo la pantalla.
 */
export default function NotFoundContent({
  title = 'Página no encontrada',
  description = 'Lo sentimos, la página que buscas no existe o ha sido eliminada.',
  buttonText = 'Ir al inicio',
  buttonBackText = 'Volver atrás',
}: NotFoundContentProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        // Entrada del número por líneas recortadas
        gsap.from('.tk-404-digit', {
          yPercent: 110,
          duration: 1,
          ease: 'power4.out',
          stagger: 0.08,
        });

        // El sello VOID cae y se estampa
        gsap.from('.tk-404-stamp', {
          scale: 2.4,
          opacity: 0,
          rotation: 18,
          duration: 0.55,
          delay: 0.55,
          ease: 'power4.in',
        });

        // Texto y botones
        gsap.from('.tk-404-meta', {
          opacity: 0,
          y: 18,
          duration: 0.6,
          delay: 0.75,
          ease: 'power3.out',
          stagger: 0.08,
        });

        // Asteriscos flotando como recortes de papel
        gsap.utils.toArray<HTMLElement>('.tk-404-float').forEach((el, i) => {
          gsap.to(el, {
            y: gsap.utils.random(-24, 24),
            x: gsap.utils.random(-16, 16),
            rotation: gsap.utils.random(-20, 20),
            duration: gsap.utils.random(4, 6),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: i * 0.25,
          });
        });
      }, containerRef);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="tk-root tk-grain relative flex min-h-screen items-center justify-center overflow-hidden px-4"
    >
      {/* Recortes flotantes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {['✳', '●', '▲', '✕', '◆'].map((mark, i) => (
          <span
            key={i}
            className={`tk-404-float absolute font-mono text-2xl text-ink/15 ${
              [
                'left-[12%] top-[18%]',
                'right-[16%] top-[26%]',
                'left-[20%] bottom-[24%]',
                'right-[24%] bottom-[18%]',
                'left-[55%] top-[12%]',
              ][i]
            }`}
          >
            {mark}
          </span>
        ))}
      </div>

      {/* Lomo vertical */}
      <p
        className="tk-vertical pointer-events-none absolute right-[3vw] top-1/2 hidden -translate-y-1/2 font-mono text-[10px] tracking-[0.5em] text-ash lg:block"
        aria-hidden="true"
      >
        TIKIT — ERROR 404 — TIKIT — ERROR 404
      </p>

      {/* Contenido principal */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Número 404 con sello VOID encima */}
        <div className="relative inline-block">
          <h1 className="tk-display flex text-[clamp(7rem,30vw,17rem)] leading-none" aria-label="404">
            <span className="tk-clip"><span className="tk-404-digit inline-block">4</span></span>
            <span className="tk-clip"><span className="tk-404-digit tk-outline inline-block">0</span></span>
            <span className="tk-clip"><span className="tk-404-digit inline-block">4</span></span>
          </h1>
          <span className="tk-404-stamp tk-stamp absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper/80 text-3xl text-danger sm:text-5xl">
            VOID
          </span>
        </div>

        {/* Descripción */}
        <div className="tk-404-meta mt-8">
          <h2 className="tk-condensed text-3xl sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-md font-mono text-sm leading-relaxed text-ink-2">
            {description}
          </p>
        </div>

        {/* Línea de recibo decorativa */}
        <div
          className="tk-404-meta mx-auto mt-8 flex max-w-sm items-baseline gap-2 font-mono text-xs text-ash"
          aria-hidden="true"
        >
          <span>ERROR</span>
          <span className="tk-dots-thin" />
          <span className="font-bold text-danger">404</span>
        </div>

        {/* Botones */}
        <div className="tk-404-meta mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/" className="tk-btn tk-btn-ink w-full sm:w-auto">
            {buttonText} <span aria-hidden="true">→</span>
          </Link>
          <button
            onClick={() => router.back()}
            className="tk-btn tk-btn-ghost w-full sm:w-auto"
          >
            <span aria-hidden="true">←</span> {buttonBackText}
          </button>
        </div>
      </div>

      {/* Dientes de recibo en el borde inferior */}
      <div
        className="tk-teeth tk-teeth-up absolute bottom-0 left-0 right-0 [--tk-teeth-color:var(--color-ink)]"
        aria-hidden="true"
      />
    </div>
  );
}
