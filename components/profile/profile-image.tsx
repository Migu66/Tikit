'use client';

import { useMemo } from 'react';

interface ProfileImageProps {
  image?: string | null;
  name?: string | null;
}

/**
 * Retrato de la ficha: cuadrado, con borde de tinta y sombra dura,
 * como una foto grapada a un expediente.
 */
export function ProfileImage({ image, name }: ProfileImageProps) {
  const initials = useMemo(() => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map((part) => part.charAt(0).toUpperCase()).join('').slice(0, 2);
  }, [name]);

  return (
    <div className="relative h-48 w-48">
      {image ? (
        <div className="relative h-full w-full -rotate-2 overflow-hidden border-[3px] border-ink shadow-[8px_10px_0_0_rgba(20, 27, 24,0.2)] transition-transform duration-300 hover:rotate-0">
          <img
            src={image}
            alt={name || 'Usuario'}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-full w-full -rotate-2 items-center justify-center border-[3px] border-ink bg-ink shadow-[8px_10px_0_0_rgba(20, 27, 24,0.2)] transition-transform duration-300 hover:rotate-0">
          <div className="text-center">
            <div className="tk-display text-6xl text-paper">{initials}</div>
            <div className="mt-2 font-mono text-[10px] tracking-[0.25em] text-ash">
              {name?.toUpperCase()}
            </div>
          </div>
        </div>
      )}
      {/* Grapa decorativa */}
      <span
        aria-hidden="true"
        className="absolute -top-2 left-1/2 h-3 w-10 -translate-x-1/2 rotate-3 border-2 border-ink bg-paper-2"
      />
    </div>
  );
}
