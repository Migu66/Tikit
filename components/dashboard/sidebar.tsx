'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  TicketIcon, 
  ChartBarIcon, 
  SparklesIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LanguageSelector } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const navigation = [
    {
      name: t('home'),
      href: `/${locale}/dashboard`,
      icon: HomeIcon,
      exact: true
    },
    {
      name: t('tickets'),
      href: `/${locale}/dashboard/tickets`,
      icon: TicketIcon,
      exact: false
    },
    {
      name: t('stats'),
      href: `/${locale}/dashboard/stats`,
      icon: ChartBarIcon,
      exact: false
    },
    {
      name: t('recommendations'),
      href: `/${locale}/dashboard/ai`,
      icon: SparklesIcon,
      exact: false
    }
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header - Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-900" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-900" />
            )}
          </button>

          <Link href={`/${locale}/dashboard`} className="flex items-center">
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tikit
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Selector de idioma */}
            <LanguageSelector />
            
            {/* Avatar con link al perfil */}
            <button
              onClick={() => router.push(`/${locale}/profile`)}
              className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium hover:shadow-lg transition-shadow cursor-pointer"
              aria-label="Ir al perfil"
            >
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop que empieza debajo del header */}
            <div
              className="fixed top-16 left-0 right-0 bottom-0"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menú desplegable */}
            <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-10">
              <nav className="px-4 py-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200
                        ${
                          active
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Logout button in mobile menu */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: `/${locale}` });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{tCommon('logout')}</span>
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href={`/${locale}`} className="flex items-center">
              <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tikit
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="px-4 py-2 text-xs text-gray-500">
              © 2025 Tikit
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
