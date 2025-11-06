'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

// Componentes de banderas en SVG
const SpainFlag = () => (
  <svg viewBox="0 0 36 36" className="w-6 h-6 rounded-sm">
    <path fill="#C60A1D" d="M0 27c0 2.209 1.791 4 4 4h28c2.209 0 4-1.791 4-4v-4H0v4z"/>
    <path fill="#FFC400" d="M0 13h36v10H0z"/>
    <path fill="#C60A1D" d="M32 5H4C1.791 5 0 6.791 0 9v4h36V9c0-2.209-1.791-4-4-4z"/>
  </svg>
);

const UKFlag = () => (
  <svg viewBox="0 0 41 30" className="w-6 h-5 rounded-sm">
    <rect width="41" height="30" fill="#00247D" rx="2" ry="2" />
    <path
      fill="none"
      stroke="#FFF"
      strokeWidth="5"
      d="M0 0l41 30M41 0L0 30"
    />
    <path
      fill="none"
      stroke="#CF142B"
      strokeWidth="2"
      d="M0 0l41 30M41 0L0 30"
    />
    <rect x="16" y="0" width="9" height="30" fill="#FFF" />
    <rect x="0" y="12" width="41" height="6" fill="#FFF" />
    <rect x="17.5" y="0" width="6" height="30" fill="#CF142B" />
    <rect x="0" y="13" width="41" height="4" fill="#CF142B" />
  </svg>
);


const locales = [
  { code: 'es', name: 'Español', FlagComponent: SpainFlag },
  { code: 'en', name: 'English', FlagComponent: UKFlag }
] as const;

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = locales.find(l => l.code === locale) || locales[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  const CurrentFlag = currentLocale.FlagComponent;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700  hover:bg-gray-600 transition-colors cursor-pointer"
        aria-label="Select language"
        title={currentLocale.name}
      >
        <CurrentFlag />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-20 rounded-lg overflow-hidden bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {locales.map((loc) => {
              const FlagComponent = loc.FlagComponent;
              return (
                <button
                  key={loc.code}
                  onClick={() => handleLanguageChange(loc.code)}
                  className={`w-full px-3 py-2 hover:bg-gray-100 flex items-center justify-center rounded-sm transition-colors cursor-pointer ${
                    locale === loc.code ? 'bg-gray-100' : ''
                  }`}
                  title={loc.name}
                >
                  <FlagComponent />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
