import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Lista de todos los locales soportados
  locales: ['es', 'en'],

  // Usado cuando no hay locale en la URL
  defaultLocale: 'es'
});

// Navegación helpers con type-safety
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
