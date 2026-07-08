'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

/**
 * Lomo de navegación del dashboard: una columna de tinta con el índice
 * de secciones numerado como los conceptos de un recibo. En móvil se
 * convierte en una cabecera de papel con menú desplegable de tinta.
 */
export default function Sidebar() {
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navigation = [
    { name: t('home'), href: `/${locale}/dashboard`, exact: true },
    { name: t('tickets'), href: `/${locale}/dashboard/tickets`, exact: false },
    { name: t('stats'), href: `/${locale}/dashboard/stats`, exact: false },
    { name: t('recommendations'), href: `/${locale}/dashboard/ai`, exact: false },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const changeLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const initials =
    session?.user?.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const navList = (onNavigate?: () => void) => (
    <ul className="space-y-0">
      {navigation.map((item, i) => {
        const active = isActive(item.href, item.exact);
        return (
          <li key={item.name} className="border-b border-paper/10">
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`tk-hover group flex items-baseline gap-3 px-5 py-4 transition-colors duration-300 ${
                active ? 'bg-thermal text-paper' : 'text-paper hover:text-thermal'
              }`}
            >
              <span
                className={`font-mono text-[10px] tracking-[0.2em] ${
                  active ? 'text-paper' : 'text-ash'
                }`}
              >
                /0{i + 1}
              </span>
              <span className="tk-roll tk-condensed text-xl">
                <span>{item.name}</span>
                <span>{item.name}</span>
              </span>
              {active && (
                <span aria-hidden="true" className="ml-auto font-mono text-sm">
                  ←
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* ============ Cabecera móvil ============ */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b-2 border-ink bg-paper lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Hamburguesa de tres barras de tinta */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[5px]"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span
              className={`h-[3px] w-6 bg-ink transition-transform duration-300 ${
                isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`h-[3px] w-6 bg-ink transition-opacity duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`h-[3px] w-6 bg-ink transition-transform duration-300 ${
                isMobileMenuOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </button>

          <Link href={`/${locale}/dashboard`} className="tk-display text-xl">
            TIKIT<span className="align-super text-[0.45em] text-thermal">®</span>
          </Link>

          {/* Avatar cuadrado con link al perfil */}
          <button
            onClick={() => router.push(`/${locale}/profile`)}
            className="cursor-pointer border-2 border-ink transition-shadow hover:shadow-[3px_3px_0_0_var(--color-thermal)]"
            aria-label="Ir al perfil"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Usuario'}
                className="h-9 w-9 object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center bg-ink font-mono text-xs font-bold text-paper">
                {initials}
              </span>
            )}
          </button>
        </div>

        {/* Menú desplegable móvil: panel de tinta */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed top-16 left-0 right-0 bottom-0 bg-ink/40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute top-16 left-0 right-0 z-10 border-b-2 border-ink bg-ink">
              <nav>
                {navList(() => setIsMobileMenuOpen(false))}

                <div className="flex items-center justify-between px-5 py-4">
                  {/* Idioma */}
                  <p className="font-mono text-xs">
                    {(['es', 'en'] as const).map((l, i) => (
                      <span key={l}>
                        {i > 0 && <span className="text-ash"> / </span>}
                        <button
                          onClick={() => changeLocale(l)}
                          className={
                            l === locale
                              ? 'font-bold text-paper underline decoration-thermal decoration-2 underline-offset-4'
                              : 'cursor-pointer text-ash transition-colors hover:text-thermal'
                          }
                        >
                          {l.toUpperCase()}
                        </button>
                      </span>
                    ))}
                  </p>

                  {/* Salir */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                    className="cursor-pointer font-mono text-xs font-bold uppercase tracking-[0.2em] text-thermal transition-colors hover:text-paper"
                  >
                    {tCommon('logout')} ↯
                  </button>
                </div>
              </nav>
              <div className="tk-teeth [--tk-teeth-color:var(--color-ink)] translate-y-full" aria-hidden="true" />
            </div>
          </>
        )}
      </div>

      {/* ============ Lomo de escritorio ============ */}
      <aside className="sticky top-0 left-0 hidden h-screen w-64 shrink-0 flex-col bg-ink text-paper lg:flex">
        {/* Marca */}
        <div className="border-b border-paper/10 px-5 py-6">
          <Link href={`/${locale}`} className="tk-display text-3xl">
            TIKIT<span className="align-super text-[0.45em] text-thermal">®</span>
          </Link>
          <p className="mt-2 font-mono text-[9px] tracking-[0.35em] text-ash">
            PANEL — {new Date().getFullYear()}
          </p>
        </div>

        {/* Índice de secciones */}
        <nav className="flex-1 overflow-y-auto">{navList()}</nav>

        {/* Pie: usuario, idioma y salida */}
        <div className="border-t border-paper/10">
          <Link
            href={`/${locale}/profile`}
            className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-paper/5"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Usuario'}
                className="h-9 w-9 border-2 border-paper/40 object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center border-2 border-paper/40 font-mono text-xs font-bold">
                {initials}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-mono text-xs font-bold tracking-wide">
                {session?.user?.name || 'Usuario'}
              </span>
              <span className="block font-mono text-[9px] tracking-[0.25em] text-ash transition-colors group-hover:text-thermal">
                {tCommon('profile').toUpperCase()} →
              </span>
            </span>
          </Link>

          <div className="flex items-center justify-between border-t border-paper/10 px-5 py-4">
            <p className="font-mono text-xs">
              {(['es', 'en'] as const).map((l, i) => (
                <span key={l}>
                  {i > 0 && <span className="text-ash"> / </span>}
                  <button
                    onClick={() => changeLocale(l)}
                    className={
                      l === locale
                        ? 'font-bold text-paper underline decoration-thermal decoration-2 underline-offset-4'
                        : 'cursor-pointer text-ash transition-colors hover:text-thermal'
                    }
                  >
                    {l.toUpperCase()}
                  </button>
                </span>
              ))}
            </p>

            <button
              onClick={() => signOut({ callbackUrl: `/${locale}` })}
              className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-thermal transition-colors hover:text-paper"
            >
              {tCommon('logout')} ↯
            </button>
          </div>

          <p className="border-t border-paper/10 px-5 py-3 font-mono text-[9px] tracking-[0.3em] text-ash">
            © {new Date().getFullYear()} TIKIT
          </p>
        </div>
      </aside>
    </>
  );
}
