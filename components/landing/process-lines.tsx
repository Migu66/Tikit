'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap, useSectionAnim } from './anim';
import { SplitWords } from './split-text';

/**
 * El "cómo funciona" contado como se cuenta un ticket: tres líneas con
 * concepto, puntos de guía e importe (0,00 — la broma es que todo cuesta
 * cero). Al pasar el cursor, cada línea se llena de tinta y se invierte.
 */
export function ProcessLines() {
  const t = useTranslations('landing.process');
  const rootRef = useRef<HTMLElement>(null);

  useSectionAnim(rootRef, () => {
    gsap.from('.tk-process-title .tk-word', {
      yPercent: 110,
      duration: 0.8,
      ease: 'power4.out',
      stagger: 0.06,
      scrollTrigger: { trigger: '.tk-process-title', start: 'top 82%', once: true },
    });

    gsap.utils.toArray<HTMLElement>('.tk-process-row').forEach((row, i) => {
      gsap.from(row, {
        yPercent: 42,
        opacity: 0,
        duration: 0.85,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 88%', once: true },
      });
    });
  });

  const steps = [1, 2, 3].map((n) => ({
    num: `0${n}`,
    name: t(`step${n}` as 'step1'),
    desc: t(`step${n}Desc` as 'step1Desc'),
  }));

  return (
    <section ref={rootRef} id="process" className="relative bg-paper py-28 lg:py-36">
      {/* Lomo vertical */}
      <span
        className="tk-vertical absolute left-5 top-32 hidden font-mono text-[10px] tracking-[0.4em] text-ash xl:block"
        aria-hidden="true"
      >
        {t('spine')} — TIKIT
      </span>

      <div className="mb-16 px-[4vw] lg:mb-24">
        <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-ash">
          <span className="inline-block h-2.5 w-2.5 shrink-0 bg-thermal" aria-hidden="true" />
          {t('kicker')}
        </p>
        <h2 className="tk-process-title tk-display mt-6 max-w-5xl text-[clamp(2.4rem,6.5vw,5.5rem)] lg:ml-[18%]">
          <SplitWords text={t('title')} />
        </h2>
      </div>

      <ol>
        {steps.map((step) => (
          <li key={step.num} className="tk-process-row tk-fill group border-t-2 border-ink last:border-b-2">
            <div className="relative z-10 grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-baseline gap-x-4 px-[4vw] py-10 transition-colors duration-300 group-hover:text-paper sm:grid-cols-[2.5rem_auto_minmax(2rem,1fr)_auto] sm:gap-x-6 lg:gap-x-10 lg:py-14">
              <span className="font-mono text-sm font-bold text-thermal">{step.num}</span>
              <h3 className="tk-display min-w-0 text-[clamp(1.8rem,4.8vw,3.8rem)] transition-transform duration-300 group-hover:translate-x-3">
                {step.name}
              </h3>
              <span className="tk-dots hidden sm:block" aria-hidden="true" />
              <span className="font-mono text-lg tabular-nums sm:text-2xl">{t('price')}</span>
              <p className="col-start-2 mt-3 max-w-md font-mono text-xs leading-relaxed text-ash transition-colors duration-300 group-hover:text-paper/75 sm:col-span-2 sm:text-sm">
                {step.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
