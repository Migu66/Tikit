'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { gsap, useSectionAnim } from './anim';

/**
 * El cierre: tu cuenta impresa. Un recibo gigante donde todo cuesta 0,00,
 * un TOTAL enorme en rojo termal, el botón de crear cuenta como última
 * línea del ticket y un sello de APROBADO que se estampa al hacer scroll.
 */
export function TotalCta() {
  const t = useTranslations('landing.cta');
  const locale = useLocale();
  const rootRef = useRef<HTMLElement>(null);
  const open = locale === 'es' ? 'ABRIR' : 'OPEN';

  useSectionAnim(rootRef, () => {
    gsap.from('.tk-cta-receipt', {
      yPercent: 10,
      rotation: 2,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.tk-cta-receipt', start: 'top 78%', once: true },
    });

    // Sello de goma: cae con fuerza y asienta
    const stamp = gsap.timeline({
      scrollTrigger: { trigger: '.tk-cta-receipt', start: 'top 45%', once: true },
    });
    stamp
      .from('.tk-cta-stamp', {
        scale: 2.8,
        rotation: -50,
        opacity: 0,
        duration: 0.38,
        ease: 'power4.in',
      })
      .to('.tk-cta-stamp', { scale: 0.94, duration: 0.1, ease: 'power2.out' })
      .to('.tk-cta-stamp', { scale: 1, duration: 0.22, ease: 'back.out(3)' });

    // La palabra fantasma del fondo se desplaza lenta
    gsap.to('.tk-cta-ghost', {
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: rootRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  const lines = [t('line1'), t('line2'), t('line3')];

  return (
    <section ref={rootRef} id="total" className="relative overflow-hidden bg-paper px-4 py-32 lg:py-44">
      {/* Palabra fantasma tras el recibo */}
      <span
        className="tk-cta-ghost tk-display tk-outline pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[clamp(10rem,26vw,26rem)] opacity-[0.08]"
        aria-hidden="true"
      >
        TOTAL
      </span>

      <div className="tk-cta-receipt relative mx-auto w-[min(94vw,56rem)] -rotate-1">
        {/* Sello APROBADO */}
        <span
          className="tk-cta-stamp tk-display absolute -top-8 right-2 z-20 -rotate-12 border-[5px] border-thermal px-5 py-2 text-3xl text-thermal opacity-90 sm:right-10 sm:text-5xl"
          aria-hidden="true"
        >
          {t('stamp')}
        </span>

        <div className="font-mono text-ink [box-shadow:18px_22px_0_0_rgba(20, 27, 24,0.14)]">
          <div className="tk-teeth tk-teeth-up [--tk-teeth-color:#f1f4ee]" />

          <div className="bg-[#f1f4ee] px-6 py-12 sm:px-14 sm:py-14">
            <p className="text-center text-[11px] tracking-[0.3em] text-ash">{t('kicker')}</p>

            <div className="my-8 border-t-2 border-dashed border-ink/30" />

            {/* Conceptos a 0,00 */}
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line} className="flex items-baseline gap-4 text-sm sm:text-base">
                  <span className="shrink-0">{line}</span>
                  <span className="tk-dots" aria-hidden="true" />
                  <span className="shrink-0 tabular-nums">{t('zero')}</span>
                </li>
              ))}
            </ul>

            <div className="my-8 border-t-2 border-dashed border-ink/30" />

            {/* El total */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <span className="tk-display text-2xl sm:text-4xl">{t('totalLabel')}</span>
              <span className="tk-display text-[clamp(3.6rem,9vw,7rem)] leading-none text-thermal">
                {t('totalValue')}
              </span>
            </div>

            {/* El botón es la última línea del ticket */}
            <Link
              href={`/${locale}/register`}
              data-cursor="open"
              data-cursor-label={open}
              className="tk-hover group relative mt-10 block overflow-hidden bg-ink py-6 text-center sm:py-7"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-0 bg-thermal transition-transform duration-450 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100"
              />
              <span className="tk-display relative z-10 mx-auto text-xl text-paper sm:text-3xl">
                <span className="tk-roll">
                  <span>
                    {t('button')} <span aria-hidden="true">→</span>
                  </span>
                  <span>
                    {t('button')} <span aria-hidden="true">→</span>
                  </span>
                </span>
              </span>
            </Link>

            <p className="mt-5 text-center text-[10px] tracking-[0.25em] text-ash">
              {t('buttonNote')}
            </p>

            <p className="mt-8 text-center">
              <Link
                href={`/${locale}/login`}
                data-cursor="link"
                className="font-mono text-xs tracking-[0.15em] underline decoration-thermal decoration-2 underline-offset-4 transition-colors hover:text-thermal"
              >
                {t('login')}
              </Link>
            </p>
          </div>

          <div className="tk-teeth [--tk-teeth-color:#f1f4ee]" />
        </div>
      </div>
    </section>
  );
}
