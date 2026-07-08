'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface UserMenuProps {
  userImage?: string | null;
  userName?: string | null;
}

export function UserMenu({ userImage, userName }: UserMenuProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Obtener iniciales del nombre para el avatar genérico
  const getInitials = (name?: string | null) => {
    if (!name) return name;
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

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
    router.push(`/${locale}/profile`);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ redirect: true, callbackUrl: `/${locale}` });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar cuadrado, con borde de tinta y sombra dura al abrir */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`block cursor-pointer border-2 border-ink transition-shadow duration-200 focus:outline-none focus-visible:shadow-[4px_4px_0_0_var(--color-thermal)] ${
          isOpen ? 'shadow-[4px_4px_0_0_var(--color-thermal)]' : 'hover:shadow-[4px_4px_0_0_rgba(20, 27, 24,0.35)]'
        }`}
      >
        {userImage ? (
          <img src={userImage} alt="Profile" className="h-10 w-10 object-cover" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center bg-ink font-mono text-sm font-bold text-paper">
            {getInitials(userName)}
          </span>
        )}
      </button>

      {/* Desplegable: papel de recibo con borde de tinta */}
      {isOpen && (
        <div className="tk-card absolute right-0 z-50 mt-3 w-52 animate-fade-in p-1.5">
          <button
            onClick={handleProfile}
            className="group flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left font-mono text-xs font-bold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            {t('profile')}
            <span aria-hidden="true" className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>

          <div className="mx-3 my-1 border-t-2 border-dashed border-ink/25" />

          <button
            onClick={handleSignOut}
            className="group flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left font-mono text-xs font-bold uppercase tracking-[0.15em] text-thermal transition-colors hover:bg-thermal hover:text-paper"
          >
            {t('signOut')}
            <span aria-hidden="true" className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1">↯</span>
          </button>
        </div>
      )}
    </div>
  );
}
