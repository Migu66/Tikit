'use client';

import { useMemo } from 'react';

interface ProfileImageProps {
  image?: string | null;
  name?: string | null;
}

export function ProfileImage({ image, name }: ProfileImageProps) {
  // Generar un color basado en el nombre del usuario
  const backgroundColor = useMemo(() => {
    if (!name) return 'bg-slate-400';

    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
      'bg-teal-500',
      'bg-green-500',
    ];

    const hash = name.charCodeAt(0);
    return colors[hash % colors.length];
  }, [name]);

  const initials = useMemo(() => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map((part) => part.charAt(0).toUpperCase()).join('').slice(0, 2);
  }, [name]);

  return (
    <div className="w-48 h-48">
      {image ? (
        <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-slate-200">
          <img
            src={image}
            alt={name || 'Usuario'}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`w-full h-full rounded-2xl ${backgroundColor} flex items-center justify-center border-4 border-slate-200 shadow-md`}
        >
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">{initials}</div>
            <div className="text-white text-sm opacity-80">{name}</div>
          </div>
        </div>
      )}
    </div>
  );
}
