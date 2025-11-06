'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LanguageSelector } from '@/components/ui/language-selector';
import { UserMenu } from '@/components/ui/user-menu';

export function Navbar() {
  const t = useTranslations('common');
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();

  const handleDashboardClick = () => {
    router.push(`/${locale}/dashboard`);
  };

  const logoHref = session ? `/${locale}/dashboard` : `/${locale}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={logoHref} className="flex items-center gap-2 group">
            <div className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
              Tikit
            </div>
          </Link>

          {/* Botones de la derecha */}
          <div className="flex items-center gap-3">
            {/* Selector de idioma */}
            <LanguageSelector />
            
            {session ? (
              <UserMenu userImage={session.user?.image} />
            ) : (
              <>
                {/* Botón de inicio de sesión */}
                <Link
                  href={`/${locale}/login`}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  {t('login')}
                </Link>
                
                {/* Botón de registro */}
                <Link
                  href={`/${locale}/register`}
                  className="px-4 py-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
