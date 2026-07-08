'use client';

import { useEffect, useRef } from 'react';
import { gsap } from './anim';

/**
 * Cursor personalizado con dos capas:
 *  - una mira de escáner (cruz) que sigue al puntero casi en tiempo real y
 *    reacciona a todo lo interactivo marcado con [data-cursor];
 *  - una insignia termal con retardo que aparece sobre los CTA
 *    ([data-cursor="open"]) mostrando su [data-cursor-label].
 *
 * Solo se activa con puntero fino y sin prefers-reduced-motion. El cursor
 * nativo únicamente se oculta mientras este está montado (html[data-tk-cursor]).
 */
export function CustomCursor() {
  const crossRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cross = crossRef.current;
    const badge = badgeRef.current;
    if (!fine || reduced || !cross || !badge) return;

    document.documentElement.setAttribute('data-tk-cursor', 'on');

    gsap.set([cross, badge], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    gsap.set(badge, { scale: 0 });

    const crossX = gsap.quickTo(cross, 'x', { duration: 0.14, ease: 'power3.out' });
    const crossY = gsap.quickTo(cross, 'y', { duration: 0.14, ease: 'power3.out' });
    const badgeX = gsap.quickTo(badge, 'x', { duration: 0.42, ease: 'power3.out' });
    const badgeY = gsap.quickTo(badge, 'y', { duration: 0.42, ease: 'power3.out' });

    let shown = false;
    const onMove = (e: PointerEvent) => {
      crossX(e.clientX);
      crossY(e.clientY);
      badgeX(e.clientX);
      badgeY(e.clientY);
      if (!shown) {
        shown = true;
        gsap.to(cross, { autoAlpha: 1, duration: 0.25 });
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      if (!target) return;
      const from = e.relatedTarget as Node | null;
      if (from && target.contains(from)) return; // ya estábamos dentro

      if (target.dataset.cursor === 'open') {
        if (labelRef.current) {
          labelRef.current.textContent = target.dataset.cursorLabel ?? '';
        }
        gsap.to(badge, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)' });
        gsap.to(cross, { rotation: 45, scale: 0.5, duration: 0.3, ease: 'power3.out' });
      } else {
        gsap.to(cross, { rotation: 90, scale: 1.7, duration: 0.35, ease: 'power3.out' });
      }
    };

    const onOut = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      if (!target) return;
      const to = e.relatedTarget as Node | null;
      if (to && target.contains(to)) return; // seguimos dentro

      gsap.to(badge, { scale: 0, autoAlpha: 0, duration: 0.25, ease: 'power3.in' });
      gsap.to(cross, { rotation: 0, scale: 1, duration: 0.35, ease: 'power3.out' });
    };

    const onDown = () => gsap.to(cross, { scale: 0.7, duration: 0.15 });
    const onUp = () => gsap.to(cross, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
    const onLeaveDoc = () => {
      shown = false;
      gsap.to([cross, badge], { autoAlpha: 0, duration: 0.2 });
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeaveDoc);
    window.addEventListener('blur', onLeaveDoc);

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeaveDoc);
      window.removeEventListener('blur', onLeaveDoc);
      document.documentElement.removeAttribute('data-tk-cursor');
      gsap.killTweensOf([cross, badge]);
    };
  }, []);

  return (
    <>
      {/* Mira de escáner: invierte el color de lo que tiene debajo */}
      <div
        ref={crossRef}
        className="pointer-events-none fixed left-0 top-0 z-[120] opacity-0 mix-blend-difference"
        aria-hidden="true"
      >
        <div className="relative h-5 w-5">
          <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white" />
          <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white" />
        </div>
      </div>

      {/* Insignia termal de los CTA */}
      <div
        ref={badgeRef}
        className="pointer-events-none fixed left-0 top-0 z-[119] opacity-0"
        aria-hidden="true"
      >
        <div className="flex h-20 w-20 -rotate-12 items-center justify-center rounded-full bg-thermal">
          <span
            ref={labelRef}
            className="font-mono text-[11px] font-bold tracking-[0.18em] text-paper"
          />
        </div>
      </div>
    </>
  );
}
