'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap, useSectionAnim } from './anim';

/** Dígito de odómetro: una columna 0–9 que rueda hasta su valor con transform. */
function RollingDigit({ digit, className = '' }: { digit: string; className?: string }) {
  return (
    <span className={`block h-[0.9em] overflow-hidden leading-[0.9] ${className}`}>
      <span className="sr-only">{digit}</span>
      <span
        className="tk-odo-col block"
        data-digit={digit}
        aria-hidden="true"
        style={{ transform: `translateY(-${Number(digit) * 10}%)` }}
      >
        {Array.from({ length: 10 }, (_, k) => (
          <span key={k} className="block h-[0.9em] leading-[0.9]">
            {k}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Los números del producto en una retícula suiza de trazos gruesos con el
 * horizonte roto: cada celda arranca a una altura distinta y su cifra rueda
 * como el contador de una caja registradora al entrar en pantalla.
 */
export function StatsGrid() {
  const t = useTranslations('landing.stats');
  const rootRef = useRef<HTMLElement>(null);

  useSectionAnim(rootRef, () => {
    // El dígito correcto ya está puesto en el markup (estado sin JS /
    // reduced-motion); aquí solo se anima el rodillo desde cero hasta él.
    gsap.fromTo(
      '.tk-odo-col',
      { yPercent: 0 },
      {
        yPercent: (_, el) => -10 * Number((el as HTMLElement).dataset.digit ?? 0),
        duration: 1.7,
        ease: 'power4.inOut',
        stagger: 0.12,
        scrollTrigger: { trigger: '.tk-stats-grid', start: 'top 78%', once: true },
      }
    );

    gsap.utils.toArray<HTMLElement>('.tk-stats-cell').forEach((cell, i) => {
      gsap.from(cell, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.tk-stats-grid', start: 'top 82%', once: true },
      });
    });
  });

  const offsets = ['lg:pt-14', 'lg:pt-36', 'lg:pt-20', 'lg:pt-44'];
  const stats = [1, 2, 3, 4].map((n, i) => ({
    value: t(`s${n}Value` as 's1Value'),
    label: t(`s${n}Label` as 's1Label'),
    note: t(`s${n}Note` as 's1Note'),
    offset: offsets[i],
    thermal: n === 4,
  }));

  return (
    <section ref={rootRef} id="stats" className="relative bg-paper">
      <div className="flex flex-wrap items-end justify-between gap-6 px-[4vw] pb-14 pt-24 lg:pt-32">
        <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-ash">
          <span className="inline-block h-2.5 w-2.5 shrink-0 bg-thermal" aria-hidden="true" />
          {t('kicker')}
        </p>
        <h2 className="tk-display ml-auto text-right text-[clamp(2.2rem,6vw,5rem)]">
          {t('title')}
        </h2>
      </div>

      <div className="tk-stats-grid grid border-y-[3px] border-ink lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`tk-stats-cell border-b-[3px] border-ink px-[4vw] pb-16 pt-10 last:border-b-0 lg:border-b-0 lg:border-r-[3px] lg:px-8 lg:last:border-r-0 ${stat.offset}`}
          >
            <div
              className={`tk-display text-[clamp(5.5rem,9vw,9.5rem)] ${
                stat.thermal ? 'text-thermal' : ''
              }`}
            >
              <RollingDigit digit={stat.value} />
            </div>
            <p className="tk-condensed mt-5 text-xl sm:text-2xl">{stat.label}</p>
            <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-ash">{stat.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
