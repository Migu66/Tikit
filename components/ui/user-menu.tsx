'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface UserMenuProps {
  userImage?: string | null;
}

export function UserMenu({ userImage }: UserMenuProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleProfile = () => {
    router.push(`/${locale}/dashboard`);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ redirect: true, callbackUrl: `/${locale}` });
  };

  return (
    <div className="relative mt-1" ref={menuRef}>
      {/* Botón de perfil/avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
      >
        {userImage && (
          <img
            src={userImage}
            alt="Profile"
            className="w-11 h-11 rounded-full"
          />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* Perfil */}
          <button
            onClick={handleProfile}
            className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {t('profile')}
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

          {/* Cerrar sesión */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
