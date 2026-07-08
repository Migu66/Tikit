'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { gsap, useSectionAnim } from '@/components/landing/anim';
import { Marquee } from '@/components/landing/marquee';

const BARCODE = [2, 1, 3, 1, 1, 4, 2, 1, 1, 3, 2, 4, 1, 1, 2, 3, 1, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2, 1];

/**
 * Pie de recibo: marquesina de agradecimiento, código de barras, columnas
 * en mono y la marca gigante cortada por el borde inferior de la página.
 */
export function Footer() {
  const t = useTranslations('landing.footer');
  const locale = useLocale();
  const rootRef = useRef<HTMLElement>(null);
  const year = new Date().getFullYear();

  useSectionAnim(rootRef, () => {
    gsap.from('.tk-footer-bar', {
      scaleY: 0,
      transformOrigin: 'bottom',
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.018,
      scrollTrigger: { trigger: '.tk-footer-barcode', start: 'top 92%', once: true },
    });
    gsap.from('.tk-footer-giant', {
      yPercent: 55,
      duration: 1.1,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.tk-footer-giant-clip', start: 'top 96%', once: true },
    });
  });

  const columns = [
    {
      title: t('colProduct'),
      links: [
        { label: t('linkProcess'), href: '#process' },
        { label: t('linkFeatures'), href: '#features' },
        { label: t('linkApi'), href: '/api-docs' },
      ],
    },
    {
      title: t('colAccount'),
      links: [
        { label: t('linkLogin'), href: `/${locale}/login` },
        { label: t('linkRegister'), href: `/${locale}/register` },
      ],
    },
    {
      title: t('colContact'),
      links: [
        { label: t('linkGithub'), href: 'https://github.com/Migu66/Tikit', external: true },
        {
          label: t('linkLinkedin'),
          href: 'https://www.linkedin.com/in/miguel-gonz%C3%A1lez-pascual-9a62b6292/',
          external: true,
        },
        { label: t('linkEmail'), href: 'mailto:miguelgp789@gmail.com', external: true },
      ],
    },
  ];

  return (
    <footer ref={rootRef} className="relative bg-ink text-paper">
      <div className="tk-teeth" aria-hidden="true" />

      <Marquee
        text={t('thanks')}
        reverse
        duration={30}
        className="border-b border-paper/15 py-4 font-mono text-xs tracking-[0.3em] text-ash"
      />

      <div className="grid gap-14 px-[4vw] py-16 lg:grid-cols-12 lg:py-20">
        {/* Código de barras */}
        <div className="lg:col-span-4">
          <div className="tk-footer-barcode flex h-16 items-stretch gap-[3px]" aria-hidden="true">
            {BARCODE.map((w, i) => (
              <span key={i} className="tk-footer-bar bg-paper" style={{ width: `${w * 2}px` }} />
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px] tracking-[0.45em] text-ash">{t('barcode')}</p>
        </div>

        {/* Columnas de enlaces */}
        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-5 font-mono text-[10px] tracking-[0.35em] text-ash">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        data-cursor="link"
                        className="inline-block font-mono text-sm font-bold tracking-[0.1em] transition-[color,transform] duration-300 hover:translate-x-1.5 hover:text-thermal"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        data-cursor="link"
                        className="inline-block font-mono text-sm font-bold tracking-[0.1em] transition-[color,transform] duration-300 hover:translate-x-1.5 hover:text-thermal"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Línea legal */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper/15 px-[4vw] py-5 font-mono text-[10px] tracking-[0.2em] text-ash">
        <p>
          © {year} TIKIT — {t('legal')}
        </p>
        <p>{t('made')}</p>
      </div>

      {/* Marca gigante cortada por el borde */}
      <div className="tk-footer-giant-clip overflow-hidden" aria-hidden="true">
        <p className="tk-footer-giant tk-display translate-y-[24%] whitespace-nowrap px-[2vw] text-[clamp(6rem,23vw,23rem)] leading-[0.78]">
          TIKIT<span className="text-thermal">.</span>
        </p>
      </div>
    </footer>
  );
}
