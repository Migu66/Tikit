'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap, useSectionAnim } from './anim';
import { SplitChars } from './split-text';

/**
 * Las capacidades como índice de documento sobre tinta: filas numeradas,
 * descripciones alineadas a la derecha y un número fantasma gigante que
 * cambia según la fila que tocas. Sin tarjetas, sin iconos.
 */
export function FeaturesIndex() {
  const t = useTranslations('landing.features');
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useSectionAnim(rootRef, () => {
    gsap.from('.tk-feat-title .tk-char', {
      yPercent: 115,
      duration: 0.8,
      ease: 'power4.out',
      stagger: 0.03,
      scrollTrigger: { trigger: '.tk-feat-title', start: 'top 80%', once: true },
    });

    gsap.utils.toArray<HTMLElement>('.tk-feat-row').forEach((row, i) => {
      gsap.from(row, {
        yPercent: 36,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.07,
        ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 90%', once: true },
      });
    });

    // El número fantasma sube lentamente mientras se recorre la sección
    gsap.to('.tk-feat-ghost', {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: rootRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  const titleWords = t('title').split(' ');
  const features = [1, 2, 3, 4].map((n) => ({
    num: `0${n}`,
    name: t(`f${n}` as 'f1'),
    desc: t(`f${n}Desc` as 'f1Desc'),
  }));

  return (
    <section ref={rootRef} id="features" className="relative bg-ink text-paper">
      {/* Rasgado: el papel de arriba se despega de la tinta */}
      <div className="tk-teeth" aria-hidden="true" />

      {/* Número fantasma de la fila activa */}
      <div
        className="tk-feat-ghost pointer-events-none absolute right-[2vw] top-[24%] hidden select-none 2xl:block"
        aria-hidden="true"
      >
        <span
          key={active}
          className="tk-display tk-outline-paper animate-fade-in block text-[19rem] leading-none opacity-30"
        >
          {features[active].num}
        </span>
      </div>

      <div className="relative px-[4vw] py-28 lg:py-36">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-8 lg:mb-24">
          <div>
            <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-thermal">
              <span className="inline-block h-2.5 w-2.5 shrink-0 bg-thermal" aria-hidden="true" />
              {t('kicker')}
            </p>
            <h2 className="tk-feat-title tk-display mt-6 text-[clamp(3rem,10vw,9rem)]">
              {titleWords.map((word, i) => (
                <span
                  key={i}
                  className={i === titleWords.length - 1 ? 'tk-outline-paper' : undefined}
                >
                  <SplitChars text={word} />
                  {i < titleWords.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
          </div>
          <p className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-ash lg:flex">
            {t('hint')}
            <span className="tk-blink inline-block h-3 w-2 bg-thermal" aria-hidden="true" />
          </p>
        </div>

        <ol className="border-t border-paper/25">
          {features.map((feature, i) => (
            <li key={feature.num} className="border-b border-paper/25">
              <div
                className="group grid grid-cols-[3rem_1fr] items-baseline gap-x-6 py-8 lg:grid-cols-[5rem_1fr_minmax(0,24rem)] lg:gap-x-10 lg:py-10"
                onMouseEnter={() => setActive(i)}
                data-cursor="link"
              >
                <span className="font-mono text-sm font-bold text-ash transition-colors duration-300 group-hover:text-thermal">
                  {feature.num}
                </span>
                <h3 className="tk-display relative text-[clamp(1.7rem,4.4vw,3.4rem)] transition-transform duration-300 group-hover:translate-x-3">
                  <span
                    className="absolute -left-10 hidden -translate-x-3 text-thermal opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 lg:inline-block"
                    aria-hidden="true"
                  >
                    →
                  </span>
                  <span className="transition-colors duration-300 group-hover:text-thermal">
                    {feature.name}
                  </span>
                </h3>
                <p className="col-start-2 mt-2 max-w-xl font-mono text-xs leading-relaxed text-ash transition-colors duration-300 group-hover:text-paper lg:col-start-3 lg:mt-0 lg:text-sm">
                  {feature.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Rasgado inferior: la tinta se despega hacia el papel siguiente */}
      <div className="tk-teeth tk-teeth-up" aria-hidden="true" />
    </section>
  );
}
