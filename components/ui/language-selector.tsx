'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

const locales = ['es', 'en'] as const;

/**
 * Conmutador de idioma tipográfico "ES / EN", como la línea de idioma
 * de la cabecera de la landing. Sin banderas ni desplegables.
 */
export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <p className="font-mono text-xs" aria-label="Idioma / Language">
      {locales.map((l, i) => (
        <span key={l}>
          {i > 0 && <span className="text-ash"> / </span>}
          <button
            onClick={() => handleLanguageChange(l)}
            aria-current={l === locale ? 'true' : undefined}
            className={
              l === locale
                ? 'cursor-default font-bold text-ink underline decoration-thermal decoration-2 underline-offset-4'
                : 'cursor-pointer text-ash transition-colors duration-300 hover:text-thermal'
            }
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </p>
  );
}
