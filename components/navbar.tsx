'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LanguageSelector } from '@/components/ui/language-selector'
import { UserMenu } from '@/components/ui/user-menu'

/**
 * Cabecera global tipo primera línea de documento: marca, nº de expediente
 * y acciones en mono. La landing y el dashboard dibujan su propio chrome.
 */
export function Navbar() {
    const t = useTranslations('common')
    const locale = useLocale()
    const { data: session } = useSession()
    const pathname = usePathname()

    // La landing dibuja su propia cabecera y el dashboard tiene su lomo propio
    if (
        pathname === '/' ||
        pathname === `/${locale}` ||
        pathname === `/${locale}/` ||
        pathname.startsWith(`/${locale}/dashboard`)
    ) {
        return null
    }

    const logoHref = session ? `/${locale}/dashboard` : `/${locale}`

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-ink bg-paper">
            <div className="flex h-16 items-center justify-between px-[4vw]">
                {/* Marca */}
                <Link href={logoHref} className="tk-display text-xl sm:text-2xl">
                    TIKIT<span className="align-super text-[0.45em] text-thermal">®</span>
                </Link>

                <div className="flex items-center gap-4 sm:gap-6">
                    <LanguageSelector />

                    {session ? (
                        <UserMenu
                            userImage={session.user?.image}
                            userName={session.user?.name}
                        />
                    ) : (
                        <>
                            {/* Entrar */}
                            <Link
                                href={`/${locale}/login`}
                                className="tk-hover font-mono text-xs font-bold tracking-[0.15em] uppercase"
                            >
                                <span className="tk-roll">
                                    <span>{t('login')}</span>
                                    <span className="text-thermal">{t('login')}</span>
                                </span>
                            </Link>

                            {/* Crear cuenta */}
                            <Link
                                href={`/${locale}/register`}
                                className="group relative overflow-hidden bg-ink px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-paper sm:px-6"
                            >
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 origin-bottom scale-y-0 bg-thermal transition-transform duration-450 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100"
                                />
                                <span className="relative z-10">{t('register')}</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
