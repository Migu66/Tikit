'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

/**
 * Cabecera propia de la landing, compuesta como la primera línea de un
 * documento: nombre, número de expediente y acciones. La navbar global
 * de la app no se muestra en la home.
 */
export function LandingHeader() {
  const t = useTranslations('landing.header');
  const locale = useLocale();
  const open = locale === 'es' ? 'ABRIR' : 'OPEN';

  return (
    <header className="absolute inset-x-0 top-0 z-40 border-b-2 border-ink/15">
      <div className="flex h-20 items-center justify-between gap-4 px-[4vw]">
        {/* Marca */}
        <Link href={`/${locale}`} className="tk-display text-2xl sm:text-3xl" data-cursor="link">
          TIKIT<span className="align-super text-[0.45em] text-thermal">®</span>
        </Link>

        {/* Nº de documento */}
        <p className="hidden font-mono text-[10px] tracking-[0.3em] text-ash lg:block">
          {t('doc')}
        </p>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Idioma */}
          <p className="font-mono text-xs">
            {(['es', 'en'] as const).map((l, i) => (
              <span key={l}>
                {i > 0 && <span className="text-ash"> / </span>}
                <Link
                  href={`/${l}`}
                  data-cursor="link"
                  aria-current={l === locale ? 'page' : undefined}
                  className={
                    l === locale
                      ? 'font-bold text-ink underline decoration-thermal decoration-2 underline-offset-4'
                      : 'text-ash transition-colors hover:text-thermal'
                  }
                >
                  {l.toUpperCase()}
                </Link>
              </span>
            ))}
          </p>

          {/* Entrar */}
          <Link
            href={`/${locale}/login`}
            data-cursor="link"
            className="tk-hover hidden font-mono text-xs font-bold tracking-[0.15em] sm:block"
          >
            <span className="tk-roll">
              <span>{t('login')}</span>
              <span className="text-thermal">{t('login')}</span>
            </span>
          </Link>

          {/* Crear cuenta */}
          <Link
            href={`/${locale}/register`}
            data-cursor="open"
            data-cursor-label={open}
            className="group relative overflow-hidden bg-ink px-4 py-2.5 font-mono text-xs font-bold tracking-[0.15em] text-paper sm:px-6"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-bottom scale-y-0 bg-thermal transition-transform duration-450 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100"
            />
            <span className="relative z-10">{t('register')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
