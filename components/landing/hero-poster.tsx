'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { gsap, useSectionAnim } from './anim';
import { SplitChars, SplitWords } from './split-text';
import { ReceiptCard } from './receipt-card';

/**
 * Hero compuesto como un póster suizo: banda de utilidad arriba (kicker,
 * subtítulo y CTA), el ticket térmico colgando por la derecha y el titular
 * gigante anclado abajo, cruzándose con el ticket (la 2ª línea pasa por
 * encima, la 3ª por debajo). Sello giratorio en la juntura.
 */
export function HeroPoster() {
  const t = useTranslations('landing.hero');
  const locale = useLocale();
  const rootRef = useRef<HTMLElement>(null);
  const open = locale === 'es' ? 'ABRIR' : 'OPEN';

  useSectionAnim(rootRef, () => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.from('.tk-hero-kicker', { opacity: 0, y: 14, duration: 0.5 }, 0.05)
      .from(
        '.tk-hero-title .tk-char',
        { yPercent: 118, rotation: 6, duration: 0.9, stagger: 0.022 },
        0.15
      )
      .from(
        '.tk-hero-receipt-inner',
        { yPercent: 18, rotation: 7, opacity: 0, duration: 1.1, ease: 'power3.out' },
        0.4
      )
      .from('.tk-hero-sub .tk-word', { yPercent: 112, duration: 0.6, stagger: 0.014 }, 0.55)
      .from('.tk-hero-cta', { y: 28, opacity: 0, duration: 0.6 }, 0.8)
      .from(
        '.tk-hero-stamp',
        { scale: 0, rotation: -70, opacity: 0, duration: 0.7, ease: 'back.out(1.6)' },
        0.95
      )
      .from('.tk-hero-meta', { opacity: 0, y: 10, duration: 0.5, stagger: 0.08 }, 1.0);

    // Parallax al hacer scroll: el ticket sube más lento, el titular se hunde.
    // Sobre las líneas (.tk-clip), no sobre el h1: así cada línea conserva su
    // z-index frente al ticket (la 2ª por encima, las demás por debajo).
    const scrub = {
      trigger: rootRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    };
    gsap.to('.tk-hero-receipt', { yPercent: -12, ease: 'none', scrollTrigger: scrub });
    gsap.to('.tk-hero-title .tk-clip', { yPercent: 12, ease: 'none', scrollTrigger: scrub });
    gsap.to('.tk-hero-stamp', { yPercent: -70, ease: 'none', scrollTrigger: scrub });

    // Flotación permanente del ticket y flecha de scroll
    gsap.to('.tk-hero-receipt-inner', {
      y: -12,
      duration: 3.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.to('.tk-hero-scroll-arrow', {
      y: 6,
      duration: 0.7,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative flex min-h-svh flex-col overflow-hidden px-[4vw] pb-16 pt-28 lg:pt-32"
    >
      {/* Ticket térmico colgando por la derecha */}
      <div className="tk-hero-receipt absolute right-[12vw] top-[11vh] z-10 hidden w-[clamp(19rem,27vw,25rem)] rotate-[5deg] lg:block">
        <div className="tk-hero-receipt-inner">
          <ReceiptCard />
        </div>
      </div>

      {/* Banda de utilidad: kicker, subtítulo y CTA */}
      <div className="relative z-20 max-w-md">
        <p className="tk-hero-kicker flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-ash">
          <span className="inline-block h-2.5 w-2.5 shrink-0 bg-thermal" aria-hidden="true" />
          {t('kicker')}
        </p>

        <p className="tk-hero-sub mt-7 font-mono text-sm leading-relaxed sm:text-base">
          <SplitWords text={t('sub')} />
        </p>

        <div className="tk-hero-cta mt-8 flex flex-wrap items-center gap-5">
          <Link
            href={`/${locale}/register`}
            data-cursor="open"
            data-cursor-label={open}
            className="group relative overflow-hidden border-[3px] border-ink px-7 py-4"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-450 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100"
            />
            <span className="tk-display relative z-10 text-lg text-ink transition-colors duration-300 group-hover:text-paper sm:text-xl">
              {t('cta')} <span aria-hidden="true">→</span>
            </span>
          </Link>
          <span className="font-mono text-[10px] tracking-[0.2em] text-ash">{t('ctaNote')}</span>
        </div>
      </div>

      <div className="min-h-10 flex-1" />

      {/* Titular gigante anclado abajo, cruzándose con el ticket */}
      <h1 className="tk-hero-title tk-display relative text-[clamp(4rem,15.5vw,14.5rem)] leading-[0.85]">
        <span className="tk-clip">
          <span className="tk-outline inline-block">
            <SplitChars text={t('line1')} />
          </span>
        </span>
        <span className="tk-clip relative z-20 ml-[6vw]">
          <SplitChars text={t('line2')} />
        </span>
        <span className="tk-clip ml-[13vw] text-thermal">
          <SplitChars text={t('line3')} />
        </span>
      </h1>

      {/* Sello giratorio en la juntura entre texto y ticket */}
      <Link
        href={`/${locale}/register`}
        data-cursor="open"
        data-cursor-label={open}
        className="tk-hero-stamp absolute left-[47%] top-[24%] z-30 hidden h-40 w-40 xl:block"
        aria-label={t('cta')}
      >
        <svg viewBox="0 0 100 100" className="tk-spin h-full w-full" aria-hidden="true">
          <defs>
            <path
              id="tk-stamp-circle"
              d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
              fill="none"
            />
          </defs>
          <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle
            cx="50"
            cy="50"
            r="25"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="2.5 2.5"
          />
          <text className="font-mono" fontSize="8.6" letterSpacing="1">
            <textPath href="#tk-stamp-circle" fill="currentColor">
              {t('stamp')}
            </textPath>
          </text>
        </svg>
        {/* Flecha como texto girado: evita la presentación emoji de ↗ */}
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="tk-display inline-block -rotate-45 text-4xl text-thermal">→</span>
        </span>
      </Link>

      {/* Metadatos de márgenes, como una ficha técnica */}
      <div className="absolute inset-x-[4vw] bottom-5 flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-ash">
        <span className="tk-hero-meta flex items-center gap-2">
          {t('scroll')}
          <span className="tk-hero-scroll-arrow inline-block" aria-hidden="true">
            ↓
          </span>
        </span>
        <span className="tk-hero-meta hidden sm:block">{t('meta1')}</span>
        <span className="tk-hero-meta hidden md:block">{t('meta2')}</span>
      </div>

      {/* Versión móvil del ticket, en flujo */}
      <div className="mx-auto mt-14 w-[min(20rem,88%)] rotate-2 lg:hidden">
        <ReceiptCard />
      </div>
    </section>
  );
}
