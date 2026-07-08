'use client';

import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/**
 * Ejecuta las animaciones GSAP de una sección dentro de un contexto con scope
 * (los selectores del builder solo alcanzan la propia sección) y respetando
 * prefers-reduced-motion: si el usuario lo pide, no se anima nada y el
 * contenido queda visible en su estado final.
 */
export function useSectionAnim(
  scope: RefObject<HTMLElement | null>,
  build: () => void
) {
  useEffect(() => {
    if (!scope.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(build, scope);
      return () => ctx.revert();
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
